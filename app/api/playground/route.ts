import { seededPlayground } from "@/lib/seed/dataset";
import { detectCapabilities } from "@/lib/engine/detect";
import { ok, fail } from "@/lib/http";

// GET /api/playground?domain=... returns the top developers in a domain from the
// seeded set (CONTEXT.md section 3.12).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = (searchParams.get("domain") || "").trim();
  if (!domain) return fail("Enter a domain to explore.", 400);
  try {
    const [skills, developers] = await Promise.all([
      detectCapabilities(domain),
      Promise.resolve(seededPlayground(domain, 12)),
    ]);
    return ok({
      domain,
      skills,
      count: developers.length,
      developers: developers.map((d, i) => ({ ...d, rank: i + 1 })),
    });
  } catch {
    return fail("We could not map that domain right now. Try again shortly.", 500);
  }
}
