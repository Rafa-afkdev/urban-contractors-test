'use server';
import { Resend } from "resend";

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export async function SendEmail(sendTo: string, subject: string, body: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Urban Contractors <noreply@urbcontractors.com>',
      to: [sendTo],
      subject: subject,
      html: body,
    });
    
    if (error) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`);
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in SendEmail:", error);
    throw error;
  }
}

export async function SendEmailWithAttachments(
  sendTo: string, 
  subject: string, 
  body: string,
  attachments?: EmailAttachment[]
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailPayload: any = {
      from: 'Urban Contractors <noreply@urbcontractors.com>',
      to: [sendTo],
      subject: subject,
      html: body,
    };

    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
      }));
    }

    const { data, error } = await resend.emails.send(emailPayload);
    
    if (error) {
      console.error("Error sending email with attachments:", error);
      throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`);
    }

    console.log("Email with attachments sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in SendEmailWithAttachments:", error);
    throw error;
  }
}
