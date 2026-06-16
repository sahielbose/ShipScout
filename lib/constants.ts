// Brand and config constants. GITHUB_URL points at the real repo per the build
// instructions (CONTEXT.md section 1.1 step 3).
export const GITHUB_URL = "https://github.com/sahielbose/ShipScout";

export const APP_NAME = "ShipScout";
export const APP_TAGLINE = "Find elite engineers by what they ship";

// Allow using the workspace without a signed-in session in local dev.
export const ALLOW_GUEST =
  process.env.NEXT_PUBLIC_ALLOW_GUEST === "true" || process.env.NODE_ENV !== "production";

// Suggestion chips shown on the search home (CONTEXT.md section 3.3).
export const SUGGESTION_CHIPS = [
  "Cryptography specialists",
  "Quantum computing researchers",
  "Database query optimizer experts",
  "Low-latency trading systems engineers",
  "Compiler frontend developers",
];
