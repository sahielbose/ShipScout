"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { GITHUB_URL } from "@/lib/constants";
import { ProfileContent } from "@/components/app/ProfileContent";

// Slide-in profile drawer over the results list (CONTEXT.md section 3.7).
export function ProfileDrawer() {
  const profileLogin = useAppStore((s) => s.profileLogin);
  const profile = useAppStore((s) => s.profile);
  const loading = useAppStore((s) => s.profileLoading);
  const close = useAppStore((s) => s.closeProfile);
  const toast = useAppStore((s) => s.toast);

  const copyLink = (login: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${login}`;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {});
    toast("Profile link copied");
  };

  return (
    <div className={`profile ${profileLogin ? "open" : ""}`}>
      <span className="pf-x" role="button" aria-label="Close profile" onClick={close}>
        x
      </span>
      {loading && (
        <div className="pf-pad" style={{ color: "var(--faint)", fontSize: 13 }}>
          Loading profile...
        </div>
      )}
      {!loading && profile && (
        <ProfileContent
          c={profile}
          onPdf={() => {
            toast("Preparing PDF of " + profile.name);
            setTimeout(() => window.print(), 350);
          }}
          onShare={() => copyLink(profile.login)}
          onGithub={() => window.open(`https://github.com/${profile.login}`, "_blank", "noopener")}
        />
      )}
      {!loading && !profile && profileLogin && (
        <div className="pf-pad" style={{ color: "var(--faint)", fontSize: 13 }}>
          We could not load that profile. <a style={{ color: "var(--blue-2)" }} href={GITHUB_URL}>Report an issue.</a>
        </div>
      )}
    </div>
  );
}
