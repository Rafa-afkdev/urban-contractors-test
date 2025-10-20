'use server';
import nodemailer from 'nodemailer';

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export async function SendEmailGmail(
  sendTo: string, 
  subject: string, 
  body: string,
  attachments?: EmailAttachment[]
) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions: any = {
      from: `"Urban Contractors" <${process.env.GMAIL_USER}>`,
      to: sendTo,
      subject: subject,
      html: body,
    };

    // Agregar adjuntos si existen
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      }));
    }

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
