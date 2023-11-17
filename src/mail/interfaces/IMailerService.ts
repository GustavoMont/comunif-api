export interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  context?: { [key: string]: string | number };
}

export interface IMailerService {
  sendMail(params: SendEmailParams): Promise<void>;
}

export const IMailerService = Symbol('IMailerService');
