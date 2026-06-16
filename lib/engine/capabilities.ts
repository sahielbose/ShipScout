// Which parts of the real engine are available, based on env. Each api method
// uses the real path when its dependencies are present and falls back to the
// seeded/template path otherwise (CONTEXT.md section 1.1: grow the backend
// until the api seam is fully real).

export const caps = {
  hasDatabase: () => Boolean(process.env.DATABASE_URL),
  hasAnthropic: () => Boolean(process.env.ANTHROPIC_API_KEY),
  hasVoyage: () => Boolean(process.env.VOYAGE_API_KEY),
  hasGitHub: () => Boolean(process.env.GITHUB_TOKEN || process.env.GITHUB_APP_ID),
  hasInngest: () => Boolean(process.env.INNGEST_EVENT_KEY),
};

export function activeSources(): string[] {
  const s: string[] = ["seed"];
  if (caps.hasDatabase()) s.push("postgres");
  if (caps.hasAnthropic()) s.push("claude");
  if (caps.hasVoyage()) s.push("voyage");
  if (caps.hasGitHub()) s.push("github");
  return s;
}
