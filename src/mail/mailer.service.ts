import { Transporter, createTransport } from 'nodemailer';
import { IMailerService, SendEmailParams } from './interfaces/IMailerService';
import Handlebars from 'handlebars';
import { join, resolve } from 'path';
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';

@Injectable()
export class MailerService implements IMailerService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
      from: {
        address: process.env.EMAIL_ADDRESS,
        name: 'No-replay',
      },
    });
  }

  async getTemplate(template: string) {
    const tamplateName = template.replace('.hbs', '');
    const templateFolder = resolve(__dirname, 'templates');
    const templatePath = join(templateFolder, `${tamplateName}.hbs`);
    const templateSource = await readFile(templatePath, 'utf8');

    return Handlebars.compile(templateSource);
  }

  async sendMail({
    template,
    context = {},
    subject,
    to,
  }: SendEmailParams): Promise<void> {
    const templateCompiler = await this.getTemplate(template);
    const html = templateCompiler(context);
    await this.transporter.sendMail({
      html,
      subject,
      to,
    });
  }
}
