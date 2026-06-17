import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Public pages are indexable (CONTEXT.md section 3.11); the API is not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
