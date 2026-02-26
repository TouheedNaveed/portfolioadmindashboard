import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend {
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // If no Resend API key, log the URL for development
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_xxxxxxxxxxxx') {
        console.log(`[DEV] Password reset URL for ${email}:\n${resetUrl}`);
        return;
    }

    const { error } = await getResend().emails.send({
        from: 'AdminHub <noreply@yourdomain.com>',
        to: email,
        subject: 'Reset your AdminHub password',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#0C0C0E;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:480px;margin:40px auto;padding:40px;background:#141418;border-radius:16px;border:1px solid rgba(255,255,255,0.07);">
            <div style="margin-bottom:32px;">
              <span style="font-size:16px;font-weight:700;background:linear-gradient(135deg,#3B1FD4,#8B3FE8,#E03FD8,#FF6B35);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">AdminHub</span>
            </div>
            <h1 style="color:#F2F2ED;font-size:24px;font-weight:700;margin:0 0 12px;">Reset your password</h1>
            <p style="color:#8A8A9A;font-size:14px;line-height:1.6;margin:0 0 32px;">
              We received a request to reset the password for your AdminHub account. Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#3B1FD4,#E03FD8);color:#F2F2ED;font-size:14px;font-weight:600;padding:14px 24px;border-radius:8px;text-decoration:none;">
              Reset Password →
            </a>
            <p style="color:#4A4A5A;font-size:12px;margin:24px 0 0;text-align:center;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    });

    if (error) throw new Error(`Failed to send email: ${error.message}`);
}
