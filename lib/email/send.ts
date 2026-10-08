import { Resend } from "resend";

interface MatchNotificationPayload {
  to: string;
  recipientName: string;
  lostItemTitle: string;
  foundItemTitle: string;
  matchId: string;
  confidenceScore: number;
}

export async function sendMatchNotificationEmail({
  to,
  recipientName,
  lostItemTitle,
  foundItemTitle,
  matchId,
  confidenceScore,
}: MatchNotificationPayload) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const reviewUrl = `${baseUrl}/match/${matchId}`;
  const percentage = Math.round(confidenceScore * 100);

  const subject = `[CampusFind] AI Match Detected: ${lostItemTitle} (${percentage}% Confidence)`;
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="background-color: #0B1F4D; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">CampusFind <span style="color: #F5C542;">PORTAL</span></h1>
        <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 12px;">Automated Lost & Found Notification</p>
      </div>

      <p style="font-size: 15px; color: #1e293b;">Hello <strong>${recipientName}</strong>,</p>
      <p style="font-size: 14px; color: #334155; line-height: 1.5;">
        Our AI matching engine has detected a potential match for your reported lost item:
      </p>

      <div style="background-color: #f8fafc; border-left: 4px solid #F5C542; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600;">Your Lost Item:</p>
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0B1F4D;">${lostItemTitle}</p>
        
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600;">Recovered Found Item:</p>
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f766e;">${foundItemTitle}</p>

        <p style="margin: 0; font-size: 14px; color: #1e293b;">
          Match Confidence: <strong style="color: #0B1F4D; font-size: 16px;">${percentage}%</strong> (Semantic Embedding + Proximity)
        </p>
      </div>

      <p style="font-size: 14px; color: #475569;">
        Please review the side-by-side details, photos, and location history to confirm whether this item belongs to you:
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${reviewUrl}" style="background-color: #0B1F4D; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
          Review & Confirm Match &rarr;
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Vishwakarma Institute of Technology &bull; Campus Lost & Found Security Operations
      </p>
    </div>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey.startsWith("re_") && !resendApiKey.includes("demo")) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "CampusFind <notifications@resend.dev>",
        to: [to],
        subject,
        html: htmlBody,
      });
      console.log(`[Email Service] Sent transactional match email to ${to} via Resend.`);
      return { success: true, delivered: true, reviewUrl };
    } catch (err) {
      console.error("[Email Service] Resend dispatch error:", err);
    }
  }

  // Simulated email dispatch log for testing and local demo presentation
  console.log(`\n======================================================`);
  console.log(`[NOTIFICATION DISPATCH] New AI Match Email Generated:`);
  console.log(`To: ${to} (${recipientName})`);
  console.log(`Subject: ${subject}`);
  console.log(`Review Link: ${reviewUrl}`);
  console.log(`Confidence: ${percentage}%`);
  console.log(`======================================================\n`);

  return { success: true, delivered: false, simulated: true, reviewUrl };
}
