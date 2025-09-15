export interface EmailMessageDto {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
