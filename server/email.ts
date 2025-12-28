import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { storage } from "./storage";

export class EmailService {
  private transporter: Transporter | null = null;
  private fromAddress: string = "noreply@example.com";

  async initialize() {
    const settings = await storage.getSettings();
    
    const emailHost = settings?.emailHost || process.env.SMTP_HOST;
    const emailPort = settings?.emailPort || parseInt(process.env.SMTP_PORT || "587");
    const emailUser = settings?.emailUser || process.env.SMTP_USER;
    const emailPassword = settings?.emailPassword || process.env.SMTP_PASSWORD;
    this.fromAddress = settings?.emailFrom || process.env.SMTP_FROM || emailUser || "noreply@example.com";
    
    if (!emailHost || !emailUser || !emailPassword) {
      console.warn("Email settings not configured. Email notifications will not be sent.");
      console.warn("Configure via admin settings or set SMTP_HOST, SMTP_USER, SMTP_PASSWORD environment variables.");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    try {
      await this.transporter.verify();
      console.log("Email service ready - connected to", emailHost);
    } catch (error) {
      console.error("Email service configuration error:", error);
      this.transporter = null;
    }
  }

  async sendEmail(to: string | string[], subject: string, html: string, from?: string) {
    if (!this.transporter) {
      await this.initialize();
    }

    if (!this.transporter) {
      console.warn("Email not sent - service not configured:", subject);
      return null;
    }

    const fromAddress = from || this.fromAddress;
    const recipients = Array.isArray(to) ? to : [to];

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: recipients.join(", "),
        subject,
        html,
      });

      return info;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  async sendBulkEmail(recipients: string[], subject: string, html: string, sentBy: string) {
    const results = {
      sent: [] as string[],
      failed: [] as string[],
    };

    for (const recipient of recipients) {
      try {
        await this.sendEmail(recipient, subject, html);
        results.sent.push(recipient);
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        results.failed.push(recipient);
      }
    }

    await storage.createEmailNotification({
      subject,
      body: html,
      recipients,
      sentBy,
    });

    return results;
  }

  async sendReferralReward(toEmail: string, referrerName: string, reward: number) {
    const subject = "Congratulations! You've Earned a Referral Reward";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Referral Reward Earned!</h2>
        <p>Hi ${referrerName},</p>
        <p>Great news! You've earned a referral reward of <strong>$${reward}</strong> for referring a new user to our platform.</p>
        <p>Your reward will be processed shortly and added to your account.</p>
        <p>Thank you for being an amazing advocate of our platform!</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }

  async sendAffiliateCommission(toEmail: string, affiliateName: string, commission: number, productName: string) {
    const subject = "Affiliate Commission Earned!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">New Affiliate Sale!</h2>
        <p>Hi ${affiliateName},</p>
        <p>Congratulations! You've earned a commission of <strong>$${commission}</strong> from the sale of "${productName}".</p>
        <p>Keep up the great work promoting our products!</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }

  async sendWelcomeEmail(toEmail: string, userName: string) {
    const subject = "Welcome to Khalil Investment Company!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome Aboard!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for joining Khalil Investment Company. We're excited to have you here!</p>
        <p>Explore our features:</p>
        <ul>
          <li>Investment Management</li>
          <li>Real Estate Listings</li>
          <li>E-commerce Marketplace</li>
          <li>Social Media Management</li>
        </ul>
        <p>Get started by verifying your email and exploring our dashboard.</p>
        <br>
        <p>Best regards,<br>Khalil Investment Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }

  async sendPartnerInvestmentConfirmation(
    toEmail: string,
    userName: string,
    projectName: string,
    partnerName: string,
    amount: number,
    commission: number,
    currency: string = "USD"
  ) {
    const subject = "Partner Investment Confirmation - Khalil Investment Company";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Partner Investment Submitted</h2>
        <p>Hi ${userName},</p>
        <p>Your investment request has been submitted successfully through our partner platform.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Investment Details</h3>
          <p style="margin: 5px 0;"><strong>Partner:</strong> ${partnerName}</p>
          <p style="margin: 5px 0;"><strong>Project:</strong> ${projectName}</p>
          <p style="margin: 5px 0;"><strong>Investment Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Platform Commission:</strong> ${currency} ${commission.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Total Deducted:</strong> ${currency} ${(amount + commission).toLocaleString()}</p>
        </div>
        <p>Your investment is now being processed. You can track its status in your dashboard.</p>
        <p style="color: #666;">Note: Once confirmed by the partner, your investment will start earning returns based on the project's ROI.</p>
        <br>
        <p>Best regards,<br>Khalil Investment Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }

  async sendPartnerInvestmentStatusUpdate(
    toEmail: string,
    userName: string,
    projectName: string,
    partnerName: string,
    status: string,
    amount: number,
    currency: string = "USD"
  ) {
    const statusConfig: Record<string, { color: string; message: string }> = {
      sent: {
        color: "#3B82F6",
        message: "Your investment has been sent to the partner for processing."
      },
      confirmed: {
        color: "#10B981",
        message: "Great news! Your investment has been confirmed by the partner and is now active."
      },
      failed: {
        color: "#EF4444",
        message: "Unfortunately, there was an issue processing your investment. Please contact support."
      },
      completed: {
        color: "#8B5CF6",
        message: "Your investment has been completed and the returns have been processed."
      }
    };

    const config = statusConfig[status] || { color: "#6B7280", message: "Your investment status has been updated." };

    const subject = `Partner Investment ${status.charAt(0).toUpperCase() + status.slice(1)} - Khalil Investment Company`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${config.color};">Investment Status Update: ${status.toUpperCase()}</h2>
        <p>Hi ${userName},</p>
        <p>${config.message}</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Partner:</strong> ${partnerName}</p>
          <p style="margin: 5px 0;"><strong>Project:</strong> ${projectName}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${config.color}; font-weight: bold;">${status.toUpperCase()}</span></p>
        </div>
        <p>You can view the full details in your investment dashboard.</p>
        <br>
        <p>Best regards,<br>Khalil Investment Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }

  async sendRoiUpdateNotification(
    toEmail: string,
    userName: string,
    projectName: string,
    roiAmount: number,
    totalRoi: number,
    currency: string = "USD"
  ) {
    const subject = "ROI Update - Khalil Investment Company";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">You've Earned Returns!</h2>
        <p>Hi ${userName},</p>
        <p>Great news! Your investment in "${projectName}" has generated returns.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>This Update:</strong> <span style="color: #10B981; font-weight: bold;">+${currency} ${roiAmount.toFixed(2)}</span></p>
          <p style="margin: 5px 0;"><strong>Total ROI Earned:</strong> ${currency} ${totalRoi.toFixed(2)}</p>
        </div>
        <p>Keep investing to grow your returns!</p>
        <br>
        <p>Best regards,<br>Khalil Investment Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }

  async sendLoginNotification(toEmail: string, userName: string, loginTime: Date, ipAddress?: string, userAgent?: string) {
    const formattedTime = loginTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const subject = "New Login Detected - Khalil Investment Company";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Security Alert: New Login</h2>
        <p>Hi ${userName},</p>
        <p>We detected a new login to your Khalil Investment account:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
          ${ipAddress ? `<p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
          ${userAgent ? `<p style="margin: 5px 0;"><strong>Device:</strong> ${userAgent}</p>` : ''}
        </div>
        <p>If this was you, you can safely ignore this email.</p>
        <p style="color: #EF4444;"><strong>If this wasn't you, please secure your account immediately by changing your password.</strong></p>
        <br>
        <p>Best regards,<br>Khalil Investment Security Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }
}

export const emailService = new EmailService();
