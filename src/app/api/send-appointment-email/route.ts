import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { renderToStaticMarkup } from 'react-dom/server';
import AppointmentEmailTemplate from '@/components/emails/appointment-email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      to, 
      nombre, 
      apellido, 
      fecha, 
      hora, 
      direccion, 
      ciudad, 
      estado,
      telefono,
      notas 
    } = body;

    if (!to || !nombre || !apellido) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Renderizar el template a HTML
    const emailHtml = renderToStaticMarkup(
      AppointmentEmailTemplate({
        nombre,
        apellido,
        fecha,
        hora,
        direccion,
        ciudad,
        estado,
        telefono,
        notas
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'Urban Contractors <onboarding@resend.dev>', // Cambia esto cuando tengas tu dominio verificado
      to: [to],
      subject: `Confirmación de Cita - ${nombre} ${apellido}`,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email', details: error },
      { status: 500 }
    );
  }
}
