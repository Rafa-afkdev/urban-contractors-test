'use server';
import { Resend } from "resend";

export async function SendEmail(sendTo: string, subject: string, body: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
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
