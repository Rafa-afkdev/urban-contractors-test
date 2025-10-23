interface EmailTranslations {
  subject: string;
  title: string;
  subtitle: string;
  greeting: string;
  message: string;
  detailsTitle: string;
  labels: {
    date: string;
    time: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    notes: string;
  };
  reminderTitle: string;
  reminderText: string;
  closing: string;
  companyName: string;
  footer: {
    rights: string;
    contact: string;
    autoMessage: string;
  };
}

const translations: Record<string, EmailTranslations> = {
  en: {
    subject: 'Appointment Confirmation',
    title: 'Appointment Confirmed!',
    subtitle: 'Your visit has been successfully scheduled',
    greeting: 'Dear',
    message: 'We are pleased to confirm that your appointment has been successfully scheduled. Below you will find all the important details:',
    detailsTitle: 'Appointment Details',
    labels: {
      date: '📅 Date:',
      time: '🕐 Time:',
      address: '📍 Address:',
      city: '🏙️ City:',
      state: '🗺️ State:',
      phone: '📱 Contact Phone:',
      notes: '📝 Notes:'
    },
    reminderTitle: 'Important Reminder',
    reminderText: 'Please arrive 10 minutes before your scheduled time. If you need to cancel or reschedule your appointment, please contact us at least 24 hours in advance.',
    closing: 'If you have any questions or need more information, please do not hesitate to contact us.',
    companyName: 'Urban Contractors',
    footer: {
      rights: 'All rights reserved',
      contact: 'Contact: +1 929 358 3319',
      autoMessage: 'This is an automated email, please do not reply.'
    }
  },
  es: {
    subject: 'Confirmación de Cita',
    title: '¡Cita Confirmada!',
    subtitle: 'Su visita ha sido programada exitosamente',
    greeting: 'Estimado(a)',
    message: 'Nos complace confirmar que su cita ha sido agendada exitosamente. A continuación encontrará todos los detalles importantes:',
    detailsTitle: 'Detalles de la Cita',
    labels: {
      date: '📅 Fecha:',
      time: '🕐 Hora:',
      address: '📍 Dirección:',
      city: '🏙️ Ciudad:',
      state: '🗺️ Estado:',
      phone: '📱 Teléfono de Contacto:',
      notes: '📝 Notas:'
    },
    reminderTitle: 'Recordatorio Importante',
    reminderText: 'Por favor, llegue 10 minutos antes de la hora programada. Si necesita cancelar o reprogramar su cita, le rogamos nos contacte con al menos 24 horas de anticipación.',
    closing: 'Si tiene alguna pregunta o necesita más información, no dude en contactarnos.',
    companyName: 'Urban Contractors',
    footer: {
      rights: 'Todos los derechos reservados',
      contact: 'Contacto: +1 929 358 3319',
      autoMessage: 'Este es un correo automático, por favor no responda.'
    }
  }
};

export function getEmailTranslations(locale: string): EmailTranslations {
  return translations[locale] || translations['en'];
}

export function generateAppointmentEmailHTML(
  appointment: any,
  locale: string = 'en',
  additionalMessage?: string
): { subject: string; html: string } {
  const t = getEmailTranslations(locale);
  
  // Format date
  const fechaFormateada = appointment.fecha instanceof Date 
    ? appointment.fecha.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : appointment.fecha;

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.subject}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 2;
        }
        
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .message {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .details-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid #dee2e6;
        }
        
        .details-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
            position: relative;
        }
        
        .details-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            border-radius: 2px;
        }
        
        .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .detail-label {
            font-weight: 600;
            color: #2c3e50;
            min-width: 140px;
            font-size: 14px;
        }
        
        .detail-value {
            color: #555;
            font-size: 14px;
            flex: 1;
        }
        
        .reminder-card {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border: 2px solid #4caf50;
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .reminder-title {
            font-size: 18px;
            font-weight: 600;
            color: #2e7d32;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        
        .reminder-title::before {
            content: '⚠️';
            margin-right: 10px;
            font-size: 20px;
        }
        
        .reminder-text {
            color: #2e7d32;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .closing {
            font-size: 16px;
            color: #555;
            margin: 30px 0 20px 0;
            line-height: 1.7;
        }
        
        .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f1f3f4;
        }
        
        .signature p {
            margin: 5px 0;
            color: #555;
        }
        
        .company-name {
            font-weight: 600;
            color: #1e3c72;
            font-size: 18px;
        }
        
        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            text-align: center;
            padding: 30px;
            font-size: 14px;
        }
        
        .footer-content {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .contact-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
        }
        
        .auto-message {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 15px;
            font-style: italic;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 20px;
                width: calc(100% - 40px);
            }
            
            .content, .header {
                padding: 25px 20px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .detail-label {
                min-width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://urbcontractors.com/wp-content/uploads/2025/03/Recurso-2@2x-240x73.png" class="logo" alt="Urban Contractors Logo">
            <h1>${t.title}</h1>
            <div class="subtitle">${t.subtitle}</div>
        </div>

        <div class="content">
            <p class="greeting">${t.greeting} <strong>${appointment.nombre} ${appointment.apellido}</strong>,</p>
            
            <p class="message">${t.message}</p>
            
            <div class="details-card">
                <h3 class="details-title">${t.detailsTitle}</h3>
                
                <div class="detail-row">
                    <div class="detail-label">${t.labels.date}</div>
                    <div class="detail-value">${fechaFormateada}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">${t.labels.time}</div>
                    <div class="detail-value">${appointment.hora}</div>
                </div>
                
                ${appointment.direccion ? `
                <div class="detail-row">
                    <div class="detail-label">${t.labels.address}</div>
                    <div class="detail-value">${appointment.direccion}</div>
                </div>
                ` : ''}
                
                ${appointment.ciudad ? `
                <div class="detail-row">
                    <div class="detail-label">${t.labels.city}</div>
                    <div class="detail-value">${appointment.ciudad}</div>
                </div>
                ` : ''}
                
                ${appointment.estado ? `
                <div class="detail-row">
                    <div class="detail-label">${t.labels.state}</div>
                    <div class="detail-value">${appointment.estado}</div>
                </div>
                ` : ''}
                
                <div class="detail-row">
                    <div class="detail-label">${t.labels.phone}</div>
                    <div class="detail-value">${appointment.telefono}</div>
                </div>
                
                ${appointment.notas ? `
                <div class="detail-row">
                    <div class="detail-label">${t.labels.notes}</div>
                    <div class="detail-value">${appointment.notas}</div>
                </div>
                ` : ''}
            </div>
            
            ${additionalMessage ? `
            <div class="reminder-card" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3;">
                <h4 class="reminder-title" style="color: #1565c0;">💬 ${locale === 'es' ? 'Mensaje Especial' : 'Special Message'}</h4>
                <p class="reminder-text" style="color: #1565c0;">${additionalMessage}</p>
            </div>
            ` : ''}
            
            <div class="reminder-card">
                <h4 class="reminder-title">${t.reminderTitle}</h4>
                <p class="reminder-text">${t.reminderText}</p>
            </div>
            
            <p class="closing">${t.closing}</p>
            
            <div class="signature">
                <p>${t.closing.includes('Atentamente') ? 'Atentamente,' : 'Best regards,'}</p>
                <p class="company-name">${t.companyName}</p>
                <p>Professional Construction Services</p>
            </div>
        </div>

        <div class="footer">
            <div class="footer-content">
                <p>© 2025 ${t.companyName}</p>
                <p>${t.footer.rights}</p>
                
                <div class="contact-info">
                    <p>${t.footer.contact}</p>
                </div>
                
                <p class="auto-message">${t.footer.autoMessage}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  return {
    subject: `${t.subject} - ${appointment.nombre} ${appointment.apellido}`,
    html
  };
}
