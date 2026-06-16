import { Workspace } from "@/components/app/Workspace";

// The ShipScout workspace (CONTEXT.md sections 3.2 to 3.10). Search, results,
// filters, profile drawer, shortlist, actions, and chat, all on the real api
// seam. Gated by GitHub auth in production; open as a guest in local dev.
export default function AppPage() {
  return <Workspace />;
}
