import { Logo } from "@/components/Logo";

// Loading state for on-demand X-ray ingestion (CONTEXT.md section 3.11).
export default function Loading() {
  return (
    <div className="public-shell">
      <div className="wrap" style={{ textAlign: "center" }}>
        <Logo size={40} />
        <div style={{ marginTop: 20, color: "var(--faint)", fontSize: 14 }}>
          Building the capability X-ray from public open-source activity...
        </div>
      </div>
    </div>
  );
}
