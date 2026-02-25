import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

export class EmailService {
  static async sendOtp(toEmail: string, otp: string, userName: string): Promise<void> {
    const mailOptions = {
      from: `"Taonaire App" <${env.smtp.user}>`,
      to: toEmail,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>You requested a password reset. Use the OTP below to reset your password:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2196F3;">${otp}</span>
          </div>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Taonaire Application</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 OTP email sent to ${toEmail}`);
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      // Don't throw - log the OTP for development/testing
      console.log(`📧 [DEV] OTP for ${toEmail}: ${otp}`);
    }
  }
}
