import { logger } from "../core/logger";
import { Alert, AlertLevel } from "./alerting.service";

interface EmailConfig {
  enabled: boolean;
  provider: "smtp" | "sendgrid";
  fromAddress: string;
  recipients: string[];
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgridApiKey?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Email Alerts Service
 * Sends email notifications for critical alerts
 */
class EmailAlertsService {
  private config: EmailConfig | null = null;
  private lastAlertByRule: Map<string, number> = new Map();
  private readonly RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes between same alert

  constructor() {
    this.initializeConfig();
  }

  /**
   * Initialize configuration from environment
   */
  private initializeConfig() {
    const provider = process.env.ALERT_EMAIL_PROVIDER as "smtp" | "sendgrid" | undefined;

    if (!provider || process.env.ALERT_EMAIL_DISABLED === "true") {
      logger.info({
        msg: "email_alerts_disabled",
        provider: provider || "not_configured"
      });
      return;
    }

    const fromAddress = process.env.ALERT_EMAIL_FROM || "noreply@wadi.app";
    const recipients = (process.env.ALERT_EMAIL_RECIPIENTS || "").split(",").filter(e => e.trim());

    if (recipients.length === 0) {
      logger.warn({
        msg: "email_alerts_no_recipients"
      });
      return;
    }

    if (provider === "smtp") {
      this.config = {
        enabled: true,
        provider: "smtp",
        fromAddress,
        recipients,
        smtpConfig: {
          host: process.env.SMTP_HOST || "localhost",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER || "",
            pass: process.env.SMTP_PASS || ""
          }
        }
      };

      logger.info({
        msg: "email_alerts_configured",
        provider: "smtp",
        recipients: recipients.length
      });
    } else if (provider === "sendgrid") {
      const apiKey = process.env.SENDGRID_API_KEY;

      if (!apiKey) {
        logger.warn({
          msg: "email_alerts_sendgrid_no_api_key"
        });
        return;
      }

      this.config = {
        enabled: true,
        provider: "sendgrid",
        fromAddress,
        recipients,
        sendgridApiKey: apiKey
      };

      logger.info({
        msg: "email_alerts_configured",
        provider: "sendgrid",
        recipients: recipients.length
      });
    }
  }

  /**
   * Send email alert
   */
  async sendAlert(alert: Alert) {
    if (!this.config?.enabled) {
      return;
    }

    // Rate limit to avoid spam
    if (this.isRateLimited(alert.rule)) {
      logger.debug({
        msg: "email_alert_rate_limited",
        rule: alert.rule
      });
      return;
    }

    try {
      const template = this.generateTemplate(alert);

      if (this.config.provider === "smtp") {
        await this.sendViaSMTP(template);
      } else if (this.config.provider === "sendgrid") {
        await this.sendViaSendgrid(template);
      }

      this.lastAlertByRule.set(alert.rule, Date.now());

      logger.info({
        msg: "alert_email_sent",
        rule: alert.rule,
        provider: this.config.provider,
        recipients: this.config.recipients.length
      });
    } catch (error: any) {
      logger.error({
        msg: "alert_email_send_failed",
        rule: alert.rule,
        error: error.message
      });
    }
  }

  /**
   * Send via SMTP
   */
  private async sendViaSMTP(template: EmailTemplate): Promise<void> {
    if (!this.config?.smtpConfig) {
      throw new Error("SMTP not configured");
    }

    // Note: In production, use nodemailer
    // This is a stub that logs the email
    logger.info({
      msg: "email_would_send_smtp",
      to: this.config.recipients,
      subject: template.subject
    });

    // For now, just log
    // In production: 
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport(this.config.smtpConfig);
    // await transporter.sendMail({
    //   from: this.config.fromAddress,
    //   to: this.config.recipients.join(","),
    //   subject: template.subject,
    //   text: template.text,
    //   html: template.html
    // });
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendgrid(template: EmailTemplate): Promise<void> {
    if (!this.config?.sendgridApiKey) {
      throw new Error("SendGrid not configured");
    }

    // Note: In production, use @sendgrid/mail
    logger.info({
      msg: "email_would_send_sendgrid",
      to: this.config.recipients,
      subject: template.subject
    });

    // For now, just log
    // In production:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.config.sendgridApiKey);
    // await sgMail.send({
    //   to: this.config.recipients,
    //   from: this.config.fromAddress,
    //   subject: template.subject,
    //   text: template.text,
    //   html: template.html
    // });
  }

  /**
   * Generate email template
   */
  private generateTemplate(alert: Alert): EmailTemplate {
    const levelEmoji = alert.level === AlertLevel.CRITICAL ? "🔴" : "⚠️";
    const levelText = alert.level === AlertLevel.CRITICAL ? "CRITICAL" : "WARNING";

    const subject = `${levelEmoji} WADI Alert: ${alert.rule} (${levelText})`;

    const text = `
Alert: ${alert.rule}
Level: ${levelText}
Message: ${alert.message}
Time: ${new Date(alert.timestamp).toISOString()}

${alert.metrics ? `Metrics:\n${JSON.stringify(alert.metrics, null, 2)}` : ""}

Please check the dashboard for more details.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .alert { padding: 20px; border-radius: 8px; margin: 20px 0; }
    .alert.critical { background-color: #fee; border-left: 4px solid #f00; }
    .alert.warning { background-color: #ffe; border-left: 4px solid #f90; }
    .header { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
    .metric { background-color: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="alert ${alert.level}">
    <div class="header">${levelEmoji} ${alert.rule}</div>
    <div><strong>Level:</strong> ${levelText}</div>
    <div><strong>Message:</strong> ${alert.message}</div>
    <div><strong>Time:</strong> ${new Date(alert.timestamp).toISOString()}</div>
    
    ${
      alert.metrics
        ? `
    <div style="margin-top: 15px;">
      <strong>Metrics:</strong>
      ${Object.entries(alert.metrics)
        .map(([key, value]) => `<div class="metric"><strong>${key}:</strong> ${JSON.stringify(value)}</div>`)
        .join("")}
    </div>
    `
        : ""
    }
    
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
      <a href="https://dashboard.wadi.app" style="color: #0066cc;">View Dashboard</a>
    </div>
  </div>
</body>
</html>
    `.trim();

    return { subject, text, html };
  }

  /**
   * Check if alert is rate limited
   */
  private isRateLimited(rule: string): boolean {
    const lastTime = this.lastAlertByRule.get(rule);
    if (!lastTime) {
      return false;
    }

    const elapsed = Date.now() - lastTime;
    return elapsed < this.RATE_LIMIT_MS;
  }

  /**
   * Get configuration status
   */
  getStatus() {
    return {
      enabled: this.config?.enabled ?? false,
      provider: this.config?.provider,
      recipients: this.config?.recipients.length ?? 0
    };
  }

  /**
   * Set email recipients
   */
  setRecipients(emails: string[]) {
    if (this.config) {
      this.config.recipients = emails.filter(e => e.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
      logger.info({
        msg: "email_recipients_updated",
        count: this.config.recipients.length
      });
    }
  }

  /**
   * Reset rate limiting for testing
   */
  resetRateLimit() {
    this.lastAlertByRule.clear();
  }
}

export const emailAlerts = new EmailAlertsService();
