// GitHub data layer for ShipScout (CONTEXT.md sections 7.1, 7.2, 11).
//
// This module turns a single GitHub login into the normalized IngestedDeveloper
// shape (lib/types.ts) using mostly one GraphQL round trip, plus a small REST
// search for notable external PRs as evidence.
//
// Honesty about the data, read this before trusting the numbers:
//   - The contribution counts (commits, PRs, reviews, issues) come from GitHub's
//     contributionsCollection, which is a LAST-YEAR aggregate (a rolling ~365
//     day window), not an all-time or calendar-year total. We tag rows with the
//     current UTC year for storage, but the underlying window is GitHub's.
//   - External-PR detection (a PR merged into a repo the developer does not own)
//     is BEST EFFORT. We derive per-repo external PR counts from
//     pullRequestContributionsByRepository (owner != login) and surface a small
//     sample of notable merged PRs via REST search. This will not catch every
//     external PR and may under- or over-count in edge cases (org-owned repos
//     where the user is effectively an owner, transferred repos, and so on).
//
// GitHub App auth is the preferred production path (CONTEXT.md section 11) for
// higher limits and per-install tokens. For now we use a PAT (classic or
// fine-grained) read from GITHUB_TOKEN. TODO: add GitHub App installation auth.
//
// No network calls happen at import time: the Octokit client is built lazily.
// No em dashes, no emojis (per CONTEXT.md section 0).

import { Octokit } from "octokit";
import { withBackoff } from "./backoff";
import type {
  IngestedDeveloper,
  IngestedRepo,
  IngestedContribution,
  IngestedPullRequest,
} from "@/lib/types";

// ----- Availability and client construction -----

export function isGitHubAvailable(): boolean {
  // True when a PAT (classic or fine-grained) is configured. GitHub App support
  // would also count here once added; for the dev path the PAT is enough.
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.length > 0);
}

let cachedClient: Octokit | null = null;

function getClient(): Octokit {
  if (cachedClient) return cachedClient;
  // Read the token at call time, never at import time, so importing this module
  // is free of side effects and env-order surprises.
  cachedClient = new Octokit({ auth: process.env.GITHUB_TOKEN });
  return cachedClient;
}

// ----- GraphQL response typing -----
// The GraphQL response is otherwise untyped, so we describe just the fields we
// request. Anything optional in the schema is modeled as nullable.

interface GqlLanguageEdge {
  size: number;
  node: { name: string };
}

interface GqlRepoNode {
  name: string;
  nameWithOwner: string;
  description: string | null;
  stargazerCount: number;
  isFork: boolean;
  primaryLanguage: { name: string } | null;
  languages: { edges: GqlLanguageEdge[] | null } | null;
}

interface GqlPrByRepo {
  repository: {
    nameWithOwner: string;
    owner: { login: string };
  };
  contributions: { totalCount: number };
}

interface GqlUser {
  login: string;
  name: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isHireable: boolean | null;
  followers: { totalCount: number };
  repositories: { totalCount: number };
  topRepositories: { nodes: (GqlRepoNode | null)[] | null };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalIssueContributions: number;
    pullRequestContributionsByRepository: GqlPrByRepo[] | null;
  };
}

interface DeveloperQueryResult {
  user: GqlUser | null;
}

const DEVELOPER_QUERY = /* GraphQL */ `
  query Developer($login: String!) {
    user(login: $login) {
      login
      name
      location
      bio
      avatarUrl
      isHireable
      followers {
        totalCount
      }
      repositories(ownerAffiliations: OWNER, privacy: PUBLIC) {
        totalCount
      }
      topRepositories: repositories(
        first: 20
        ownerAffiliations: OWNER
        isFork: false
        privacy: PUBLIC
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          name
          nameWithOwner
          description
          stargazerCount
          isFork
          primaryLanguage {
            name
          }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        pullRequestContributionsByRepository(maxRepositories: 100) {
          repository {
            nameWithOwner
            owner {
              login
            }
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

// ----- REST search response typing (notable external PRs) -----

interface SearchPrItem {
  title: string;
  html_url: string;
  repository_url: string;
}

// Detect "this is the user's own repo" by comparing the repo owner login to the
// developer login, case-insensitively (GitHub logins are case-insensitive).
function ownsRepo(repoFullName: string, login: string): boolean {
  const owner = repoFullName.split("/")[0] ?? "";
  return owner.toLowerCase() === login.toLowerCase();
}

// Derive owner/name from a REST repository_url like
// https://api.github.com/repos/owner/name.
function repoFullNameFromApiUrl(repositoryUrl: string): string {
  const marker = "/repos/";
  const idx = repositoryUrl.indexOf(marker);
  if (idx === -1) return repositoryUrl;
  return repositoryUrl.slice(idx + marker.length);
}

function mapRepos(user: GqlUser): IngestedRepo[] {
  const nodes = user.topRepositories.nodes ?? [];
  const repos: IngestedRepo[] = [];
  for (const node of nodes) {
    if (!node) continue;
    const languages: Record<string, number> = {};
    for (const edge of node.languages?.edges ?? []) {
      languages[edge.node.name] = edge.size;
    }
    repos.push({
      fullName: node.nameWithOwner,
      name: node.name,
      description: node.description,
      stars: node.stargazerCount,
      primaryLanguage: node.primaryLanguage?.name ?? null,
      languages,
      isFork: node.isFork,
    });
  }
  return repos;
}

function mapContributions(user: GqlUser, year: number): IngestedContribution[] {
  const c = user.contributionsCollection;
  const rows: IngestedContribution[] = [];

  // Aggregate counts are not tied to a single repo, so use a sentinel repo name.
  // mergedExternal is false here: these are totals across all repos.
  const AGGREGATE = "*";
  rows.push({ type: "commit", repoFullName: AGGREGATE, count: c.totalCommitContributions, mergedExternal: false, year });
  rows.push({ type: "pr", repoFullName: AGGREGATE, count: c.totalPullRequestContributions, mergedExternal: false, year });
  rows.push({ type: "review", repoFullName: AGGREGATE, count: c.totalPullRequestReviewContributions, mergedExternal: false, year });
  rows.push({ type: "issue", repoFullName: AGGREGATE, count: c.totalIssueContributions, mergedExternal: false, year });

  // Per-repo external PR rows: PRs into repos the user does NOT own. Best effort
  // (see file header), derived from pullRequestContributionsByRepository.
  for (const byRepo of c.pullRequestContributionsByRepository ?? []) {
    const repoFullName = byRepo.repository.nameWithOwner;
    const external = byRepo.repository.owner.login.toLowerCase() !== user.login.toLowerCase();
    if (!external) continue;
    const count = byRepo.contributions.totalCount;
    if (count <= 0) continue;
    rows.push({ type: "pr", repoFullName, count, mergedExternal: true, year });
  }

  return rows;
}

async function fetchNotablePullRequests(
  login: string,
): Promise<IngestedPullRequest[]> {
  const octokit = getClient();
  try {
    const res = await withBackoff(() =>
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${login} is:pr is:merged`,
        sort: "reactions",
        order: "desc",
        per_page: 5,
      }),
    );
    const items = (res.data.items ?? []) as unknown as SearchPrItem[];
    return items.map((item) => {
      const repoFullName = repoFullNameFromApiUrl(item.repository_url);
      return {
        repoFullName,
        title: item.title,
        url: item.html_url,
        mergedExternal: !ownsRepo(repoFullName, login),
      };
    });
  } catch (err) {
    // Evidence is a nice-to-have; never let it sink the whole fetch.
    console.warn(`fetchNotablePullRequests failed for ${login}:`, err);
    return [];
  }
}

// Detect a GraphQL NOT_FOUND error (user does not exist).
function isNotFoundGraphqlError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { status?: number; errors?: Array<{ type?: string }> };
  if (e.status === 404) return true;
  if (Array.isArray(e.errors)) {
    return e.errors.some((it) => it?.type === "NOT_FOUND");
  }
  return false;
}

export async function fetchDeveloper(
  login: string,
): Promise<IngestedDeveloper | null> {
  const octokit = getClient();
  const year = new Date().getUTCFullYear();

  let user: GqlUser | null;
  try {
    const result = await withBackoff(() =>
      octokit.graphql<DeveloperQueryResult>(DEVELOPER_QUERY, { login }),
    );
    user = result.user;
  } catch (err) {
    if (isNotFoundGraphqlError(err)) return null;
    console.warn(`fetchDeveloper GraphQL failed for ${login}:`, err);
    return null;
  }

  // GraphQL can return user: null with a NOT_FOUND error caught above, but guard
  // the plain-null case too (a missing user with no thrown error).
  if (!user) return null;

  const repos = mapRepos(user);
  const contributions = mapContributions(user, year);
  const notablePullRequests = await fetchNotablePullRequests(user.login);

  return {
    login: user.login,
    name: user.name,
    location: user.location,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    hireable: user.isHireable,
    repos,
    contributions,
    notablePullRequests,
    fetchedAt: new Date().toISOString(),
  };
}

// ----- Top contributors (domain seeding, CONTEXT.md 7.1 method A) -----

export async function fetchTopContributors(
  repoFullName: string,
  limit = 30,
): Promise<string[]> {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    console.warn(`fetchTopContributors: invalid repo name "${repoFullName}"`);
    return [];
  }
  const octokit = getClient();
  try {
    const res = await withBackoff(() =>
      octokit.rest.repos.listContributors({
        owner,
        repo,
        // listContributors caps per_page at 100; ask for at least what we need.
        per_page: Math.min(Math.max(limit, 1), 100),
      }),
    );
    const logins: string[] = [];
    for (const c of res.data ?? []) {
      const login = c.login;
      if (!login) continue;
      // Skip bot accounts (their login ends with "[bot]").
      if (login.endsWith("[bot]")) continue;
      logins.push(login);
      if (logins.length >= limit) break;
    }
    return logins;
  } catch (err) {
    console.warn(`fetchTopContributors failed for ${repoFullName}:`, err);
    return [];
  }
}
