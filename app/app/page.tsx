import { Workspace } from "@/components/app/Workspace";
import { SignInGate } from "@/components/app/SignInGate";
import { auth, authEnabled } from "@/lib/auth";
import { ALLOW_GUEST } from "@/lib/constants";

// The ShipScout workspace (CONTEXT.md sections 3.2 to 3.10). Search, results,
// filters, profile drawer, shortlist, actions, and chat, all on the real api
// seam. Gated by GitHub auth in production; open as a guest in local dev.
export default async function AppPage() {
  if (authEnabled && !ALLOW_GUEST) {
    const session = await auth();
    if (!session) return <SignInGate />;
  }
  return <Workspace />;
}
