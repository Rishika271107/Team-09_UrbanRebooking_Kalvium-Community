import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.mailtrap.io";
const smtpPort = parseInt(process.env.SMTP_PORT || "2525", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const fromEmail = process.env.FROM_EMAIL || "no-reply@urbancompany.com";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${nextPublicAppUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: "Reset your Urban Company password",
    text: `You requested a password reset. Click the following link to set a new password: ${resetLink}. This link expires in 1 hour.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
        <h2 style="color: #0d9488; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #334155; line-height: 1.6;">You requested a password reset for your Urban Company account. Please click the button below to reset your password. This link is valid for 1 hour.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request this email, you can safely ignore it.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">If the button doesn't work, copy and paste this URL into your browser: <br/> ${resetLink}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send reset email via SMTP:", error);
    // In dev environment, log the link as a fallback
    console.log(`[PASSWORD RESET LINK (FALLBACK LOG)]: ${resetLink}`);
  }
}
