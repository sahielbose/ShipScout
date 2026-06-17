import { sendEmail, isResendAvailable } from "@/lib/email/resend";
import { ok, fail, readJson } from "@/lib/http";

// POST /api/outreach/send -> send a drafted email. Gated behind an explicit
// confirm flag (the "never auto-send" rule). With no email provider configured,
// it returns a clear message and sends nothing.
export async function POST(req: Request) {
  const body = await readJson<{ confirm?: boolean; to?: string; subject?: string; body?: string }>(req);
  if (!body) return fail("Send a JSON body with the draft to send.", 400);
  if (!body.confirm) {
    return fail("Confirm before sending. ShipScout never sends without an explicit confirm step.", 400);
  }
  if (!body.to || !body.subject || !body.body) {
    return fail("A recipient, subject, and body are required to send.", 400);
  }
  if (!isResendAvailable()) {
    return ok({
      sent: false,
      message:
        "Email sending is not configured. Copy the draft or open it in your email client instead.",
    });
  }
  const result = await sendEmail({ to: body.to, subject: body.subject, body: body.body });
  return ok({
    sent: result.sent,
    message: result.sent ? "Outreach sent." : result.detail || "Could not send the message.",
  });
}
