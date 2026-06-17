// Optional outreach sending via Resend (CONTEXT.md sections 3.9 and 5). Sending
// is never automatic: the only caller is a confirm-gated route, and the UI keeps
// draft-only Copy and Open-in-email as the default. No-op without a key.

export function isResendAvailable(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ sent: boolean; detail?: string }> {
  if (!isResendAvailable()) {
    return { sent: false, detail: "Email sending is not configured." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "ShipScout <onboarding@resend.dev>",
        to: [input.to],
        subject: input.subject,
        text: input.body,
      }),
    });
    if (!res.ok) return { sent: false, detail: "The email provider rejected the message." };
    return { sent: true };
  } catch {
    return { sent: false, detail: "Could not reach the email provider." };
  }
}
