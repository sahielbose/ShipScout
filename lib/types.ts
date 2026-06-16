// Shared ShipScout types. These are the contract between the UI (which mirrors
// the prototype) and the api seam (lib/api-client), whether it is backed by the
// seeded dataset or the real engine. No em dashes, no emojis.

export type Seniority = "Junior" | "Mid" | "Senior";

export interface LangBar {
  lang: string;
  pct: number;
  color: string;
}

export interface ActiveRepo {
  name: string;
  val: number;
}

export interface ProjectRow {
  name: string;
  lang: string;
  stars: number | string;
}

export interface Insights {
  repos: number;
  followers: number;
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  ext: number;
  active: ActiveRepo[];
  projects: ProjectRow[];
  langs: string[];
  bar: LangBar[];
}

// One developer as the UI consumes it (a candidate card plus full profile).
export interface Candidate {
  login: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  loc: string;
  seniority: Seniority;
  blurb: string;
  tags: string[];
  skills: string[];
  about: string;
  insights: Insights;
  score?: number;
}

export interface Funnel {
  total: number;
  location: number;
  match: number;
}

export interface SearchFilters {
  seniority: "Any" | Seniority;
  location: string;
  repos: string[];
}

export interface RepoFacet {
  name: string;
  stars: string;
}

export interface SearchResponse {
  searchId: string;
  detectedSkills: string[];
  candidates: Candidate[];
  total: number;
  funnel: Funnel;
  repos: RepoFacet[];
}

export interface OutreachDraft {
  subject: string;
  body: string;
  sequenceStep: number;
}

export interface ChatMessageDTO {
  role: "user" | "assistant";
  content: string;
}

export interface ShortlistCandidate {
  login: string;
  name: string;
}

// The single api seam from the prototype. Every method has one mock and one
// real implementation; the UI never knows which is live.
export interface ShipScoutApi {
  detectSkills(query: string): Promise<string[]>;
  search(query: string, filters: SearchFilters): Promise<SearchResponse>;
  getProfile(login: string): Promise<Candidate | null>;
  draftOutreach(candidate: Candidate, query: string, step: number): Promise<OutreachDraft>;
  chat(history: ChatMessageDTO[], query: string, shortlist: ShortlistCandidate[]): Promise<string>;
}

export interface ApiError {
  error: string;
  detail?: string;
}

// ----- Ingestion contract (CONTEXT.md section 7.2) -----
// The normalized shape produced by the GitHub clients and consumed by the
// enrichment step. Kept provider-agnostic so the engine can be tested offline.

export interface IngestedRepo {
  fullName: string;
  name: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  languages: Record<string, number>; // language -> bytes
  isFork: boolean;
}

export interface IngestedContribution {
  type: "commit" | "pr" | "review" | "issue";
  repoFullName: string;
  count: number;
  mergedExternal: boolean;
  year: number;
}

export interface IngestedPullRequest {
  repoFullName: string;
  title: string;
  url: string;
  mergedExternal: boolean;
}

export interface IngestedDeveloper {
  login: string;
  name: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followers: number;
  publicRepos: number;
  hireable: boolean | null;
  repos: IngestedRepo[];
  contributions: IngestedContribution[];
  notablePullRequests: IngestedPullRequest[];
  fetchedAt: string; // ISO timestamp
}

// ----- Enrichment output (CONTEXT.md section 7.3) -----
export interface EnrichedCapability {
  label: string;
  domain: string;
  confidence: number;
  evidence: string[];
}

export interface EnrichmentResult {
  capabilities: EnrichedCapability[];
  seniority: Seniority;
  seniorityReason: string;
  summary: string;
  languages: { lang: string; pct: number }[];
  signals: { externalPrsMerged: number };
}
