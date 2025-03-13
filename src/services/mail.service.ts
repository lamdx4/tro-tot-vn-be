import { google } from "googleapis";
import { Transporter, createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ConfigService } from "./config.service";


export class MailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {}
  async createTransporter() {
    const oAuth2Client = new google.auth.OAuth2(
      ConfigService.gI().getOrThrow('MAIL_CLIENT_ID'),
      ConfigService.gI().getOrThrow('MAIL_CLIENT_SECRET'),
      ConfigService.gI().getOrThrow('MAIL_REFRESH_TOKEN'),
    );
    oAuth2Client.setCredentials({
      refresh_token: ConfigService.gI().get('MAIL_REFRESH_TOKEN'),
    });
    const accessToken = await oAuth2Client.getAccessToken();
    this.transporter = createTransport({
      service: 'Gmail',
      auth: {
        type: 'OAuth2',
        user: 'djiahak@gmail.com',
        clientId: ConfigService.gI().getOrThrow('MAIL_CLIENT_ID'),
        clientSecret: ConfigService.gI().getOrThrow('MAIL_CLIENT_SECRET'),
        refreshToken: ConfigService.gI().getOrThrow('MAIL_REFRESH_TOKEN'),
        accessToken: accessToken.token || undefined,
      },
    });
  }
  async sendMail(mail: Mail.Options) {
    await this.transporter.sendMail(mail);
  }
}