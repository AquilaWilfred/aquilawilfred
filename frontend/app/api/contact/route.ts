import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error("GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local");
      return NextResponse.json(
        { error: "Email service not configured." },
        { status: 500 }
      );
    }

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass, // Gmail App Password, NOT your normal Gmail password
      },
    });

    await transporter.sendMail({
      from: `"Aquila Portfolio" <${gmailUser}>`,
      to: gmailUser, // sends to yourself
      replyTo: email, // so you can hit Reply and it goes straight to the visitor
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0C4A6E, #2E1065); padding: 36px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
                EAGLE<span style="color: #38BDF8;">WILLS</span>
              </h1>
              <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px; font-family: monospace; letter-spacing: 2px;">NEW PORTFOLIO MESSAGE</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px;">
              <div style="background: #f0f9ff; border-left: 4px solid #0EA5E9; border-radius: 0 8px 8px 0; padding: 20px 24px; margin-bottom: 28px;">
                <p style="margin: 0 0 4px; color: #0369A1; font-size: 12px; font-family: monospace; font-weight: 700; letter-spacing: 1px;">FROM</p>
                <p style="margin: 0; color: #0C4A6E; font-size: 18px; font-weight: 700;">${name}</p>
                <p style="margin: 4px 0 0; color: #0369A1; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #0369A1;">${email}</a>
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #E0F2FE; color: #64748B; font-size: 13px; font-family: monospace; width: 100px; font-weight: 700;">SUBJECT</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #E0F2FE; color: #0C4A6E; font-weight: 600;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748B; font-size: 13px; font-family: monospace; font-weight: 700; vertical-align: top; padding-top: 20px;">MESSAGE</td>
                  <td style="padding: 20px 0 12px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${message}</td>
                </tr>
              </table>

              <a href="mailto:${email}?subject=Re: ${subject}"
                style="display: inline-block; background: linear-gradient(135deg, #0EA5E9, #7C3AED); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                Reply to ${name} →
              </a>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0; color: #94A3B8; font-size: 12px; font-family: monospace;">
                Received via Aquila Portfolio · XcognVis.Com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }
}
