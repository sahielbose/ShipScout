// Public surface of the GitHub data layer (CONTEXT.md sections 7.1, 7.2).
// Re-export the things the engine and route handlers consume. The backoff helper
// stays internal to this folder but can be imported directly if a job needs it.
//
// No em dashes, no emojis (per CONTEXT.md section 0).

export { isGitHubAvailable, fetchDeveloper, fetchTopContributors } from "./client";
