import { Providers } from "@/components/Providers";

// Scope the session context to the workspace so the marketing and public pages
// do not pay for a session fetch.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
