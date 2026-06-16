import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

// Inngest serve endpoint. The dev server (npx inngest-cli dev) and the hosted
// platform both call this route to discover and run the background functions.
export const { GET, POST, PUT } = serve({ client: inngest, functions });
