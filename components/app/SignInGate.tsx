import { signIn } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { IconGitHub } from "@/components/app/Icons";

// Sign-in gate (CONTEXT.md section 3.2). Shown only when GitHub OAuth is
// configured and guest access is disabled (production). Local dev runs as a
// guest, so this never blocks the offline experience.
export function SignInGate() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
      }}
    >
      <Logo size={48} />
      <h1 className="disp" style={{ fontSize: 34, margin: "24px 0 10px" }}>
        Sign in to ShipScout
      </h1>
      <p className="sub" style={{ margin: "0 auto 28px" }}>
        Connect with GitHub to run capability searches, shortlist candidates, and
        draft outreach grounded in real open-source work.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/app" });
        }}
      >
        <button className="btn btn-white" type="submit">
          <IconGitHub width={16} height={16} /> Continue with GitHub
        </button>
      </form>
    </div>
  );
}
