import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Static public routes. Individual X-ray pages (/u/[login]) are generated on
// demand, so they are not enumerated here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/playground`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
