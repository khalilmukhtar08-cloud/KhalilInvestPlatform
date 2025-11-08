import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { storage } from "./storage";

export class EmailService {
  private transporter: Transporter | null = null;

  async initialize() {
    const settings = await storage.getSettings();
    
    if (!settings?.emailHost || !settings?.emailUser || !settings?.emailPassword) {
      console.warn("Email settings not configured. Email notifications will not be sent.");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: settings.emailHost,
      port: settings.emailPort || 587,
      secure: settings.emailPort === 465,
      auth: {
        user: settings.emailUser,
        pass: settings.emailPassword,
      },
    });

    try {
      await this.transporter.verify();
      console.log("Email service ready");
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
      throw new Error("Email service not configured");
    }

    const settings = await storage.getSettings();
    const fromAddress = from || settings?.emailFrom || settings?.emailUser || "noreply@example.com";

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
    const subject = "Welcome to Our Platform!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome Aboard!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for joining our platform. We're excited to have you here!</p>
        <p>Explore our features:</p>
        <ul>
          <li>Investment Management</li>
          <li>Real Estate Listings</li>
          <li>E-commerce Marketplace</li>
          <li>Social Media Management</li>
        </ul>
        <p>Get started by completing your profile and exploring our dashboard.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail(toEmail, subject, html);
  }
}

export const emailService = new EmailService();
