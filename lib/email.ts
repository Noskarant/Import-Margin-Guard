type ResendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'Import Margin Guard <onboarding@resend.dev>';
}

export function buildSignupConfirmationTemplate(email: string) {
  const appUrl = getAppUrl();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
      <h1 style="font-size: 22px; margin-bottom: 12px;">Welcome to Import Margin Guard</h1>
      <p style="font-size: 15px; line-height: 1.6;">Your workspace account has been created for <strong>${email}</strong>.</p>
      <p style="font-size: 15px; line-height: 1.6;">You can now upload an import file, map columns, compare sourcing scenarios, and export a decision-ready PDF summary.</p>
      <a href="${appUrl}/dashboard" style="display:inline-block; padding:12px 16px; background:#1d4ed8; color:#ffffff; text-decoration:none; border-radius:8px; margin-top:12px;">Open dashboard</a>
      <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">If you did not create this account, you can ignore this message.</p>
    </div>
  `;
}

export async function sendSignupConfirmationEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'RESEND_API_KEY missing' };

  const payload: ResendEmailPayload = {
    from: getFromAddress(),
    to: [email],
    subject: 'Your Import Margin Guard account is ready',
    html: buildSignupConfirmationTemplate(email),
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend email failed: ${text}`);
  }

  return { skipped: false };
}
