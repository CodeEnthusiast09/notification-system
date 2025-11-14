/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter, SentMessageInfo } from 'nodemailer';
import { IEmailProvider } from './email-provider.interface';
import { EmailPayload, EmailSentInfo, SMTPConfig } from '../../types';

@Injectable()
export class SMTPProvider
  implements IEmailProvider, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(SMTPProvider.name);
  private transporter: Transporter;
  private isVerified = false;

  constructor(private configService: ConfigService) {}
  async onModuleInit(): Promise<void> {
    this.initializeTransporter();
    // Verify connection on startup to warm up the pool
    await this.warmUpConnection();
  }

  onModuleDestroy() {
    if (this.transporter) {
      this.transporter.close();
      this.logger.log('SMTP connection pool closed');
    }
  }

  private initializeTransporter(): void {
    const smtpConfig = this.configService.get<SMTPConfig>('email.smtp');

    if (!smtpConfig) {
      throw new Error('SMTP configuration is missing');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
      pool: true,
      maxConnections: 5, // Max simultaneous connections
      maxMessages: 100, // Reuse connection for up to 100 messages
      // Rate limiting
      rateDelta: 1000, // 1 second window
      rateLimit: 5, // Max 5 emails per second
      // Timeouts
      connectionTimeout: 10000, // 10 seconds to establish connection
      greetingTimeout: 5000, // 5 seconds to receive greeting
      socketTimeout: 30000, // 30 seconds socket timeout
    });

    this.logger.log('SMTP transporter initialized');
  }

  private async warmUpConnection(): Promise<void> {
    try {
      this.logger.log('Warming up SMTP connection...');
      await this.transporter.verify();
      this.isVerified = true;
      this.logger.log('SMTP connection verified and pool warmed up');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `SMTP warmup failed: ${errorMessage}. Will retry on first send.`,
      );
      // Don't throw - allow the service to start and retry on first email
      this.isVerified = false;
    }
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    const smtpConfig = this.configService.get<SMTPConfig>('email.smtp');

    if (!smtpConfig) {
      throw new Error('SMTP configuration is missing');
    }

    if (!this.isVerified) {
      try {
        await this.transporter.verify();
        this.isVerified = true;
        this.logger.log('SMTP connection verified on first send');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`SMTP verification failed: ${errorMessage}`);
        // Continue anyway - sendMail will try to connect
      }
    }

    const fromEmail = smtpConfig.fromEmail;
    const fromName = smtpConfig.fromName;

    const mailOptions = {
      from: `"${payload.from?.name || fromName}" <${payload.from?.email || fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || this.stripHtml(payload.html),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      const emailInfo = info as unknown as EmailSentInfo;

      this.logger.log(`Email sent: ${emailInfo.messageId} to ${payload.to}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${errorMessage}`);
      this.isVerified = false;
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.isVerified = true;
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`SMTP verification failed: ${errorMessage}`);
      this.isVerified = false;
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}
