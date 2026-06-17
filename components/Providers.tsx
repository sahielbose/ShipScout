"use client";

import { SessionProvider } from "next-auth/react";

// Client session context for the workspace, so the sidebar can sign out.
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
