import * as React from 'react';

interface AppointmentEmailTemplateProps {
  nombre: string;
  apellido: string;
  fecha: string;
  hora: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  telefono?: string;
  notas?: string;
}

export default function AppointmentEmailTemplate({
  nombre,
  apellido,
  fecha,
  hora,
  direccion,
  ciudad,
  estado,
  telefono,
  notas,
}: AppointmentEmailTemplateProps) {
  return (
    <html>
      <head />
      <body style={main}>
        <div style={container}>
          {/* Header with Logo */}
          <div style={header}>
            <img
              src="https://your-domain.com/Logo.png"
              width="120"
              height="40"
              alt="Urban Contractors"
              style={logo}
            />
          </div>

          {/* Hero Section */}
          <div style={heroSection}>
            <p style={heroTitle}>¡Tu cita está confirmada!</p>
            <p style={heroSubtitle}>
              Hola {nombre} {apellido}, nos complace confirmar tu cita con nosotros.
            </p>
          </div>

          {/* Appointment Details Card */}
          <div style={card}>
            <p style={cardTitle}>Detalles de la Cita</p>
            <hr style={divider} />
            
            <div style={detailRow}>
              <div style={iconColumn}>
                📅
              </div>
              <div>
                <p style={detailLabel}>Fecha</p>
                <p style={detailValue}>{fecha}</p>
              </div>
            </div>

            <div style={detailRow}>
              <div style={iconColumn}>
                🕐
              </div>
              <div>
                <p style={detailLabel}>Hora</p>
                <p style={detailValue}>{hora}</p>
              </div>
            </div>

            {direccion && (
              <div style={detailRow}>
                <div style={iconColumn}>
                  📍
                </div>
                <div>
                  <p style={detailLabel}>Dirección</p>
                  <p style={detailValue}>
                    {direccion}
                    {ciudad && `, ${ciudad}`}
                    {estado && `, ${estado}`}
                  </p>
                </div>
              </div>
            )}

            {telefono && (
              <div style={detailRow}>
                <div style={iconColumn}>
                  📞
                </div>
                <div>
                  <p style={detailLabel}>Teléfono</p>
                  <p style={detailValue}>{telefono}</p>
                </div>
              </div>
            )}

            {notas && (
              <div style={detailRow}>
                <div style={iconColumn}>
                  📝
                </div>
                <div>
                  <p style={detailLabel}>Notas Adicionales</p>
                  <p style={detailValue}>{notas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Important Notes Section */}
          <div style={notesSection}>
            <p style={notesTitle}>Información Importante</p>
            <p style={notesText}>
              • Por favor, llega 10 minutos antes de tu cita
            </p>
            <p style={notesText}>
              • Si necesitas cancelar o reprogramar, contáctanos con al menos 24 horas de anticipación
            </p>
            <p style={notesText}>
              • Trae cualquier documentación relevante para tu consulta
            </p>
          </div>

          {/* Footer */}
          <div style={footer}>
            <hr style={footerDivider} />
            <p style={footerText}>
              © {new Date().getFullYear()} Urban Contractors. Todos los derechos reservados.
            </p>
            <p style={footerText}>
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 40px',
  backgroundColor: '#ffffff',
};

const logo = {
  margin: '0 auto',
};

const heroSection = {
  padding: '0 40px 32px',
  textAlign: 'center' as const,
};

const heroTitle = {
  color: '#f97316',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  lineHeight: '1.3',
};

const heroSubtitle = {
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
};

const card = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  margin: '0 40px 24px',
  padding: '32px',
  border: '1px solid #e2e8f0',
};

const cardTitle = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0 0 24px',
};

const detailRow = {
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'flex-start',
};

const iconColumn = {
  width: '40px',
  minWidth: '40px',
  fontSize: '24px',
  paddingTop: '2px',
};

const detailLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue = {
  color: '#1e293b',
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.5',
};

const notesSection = {
  padding: '0 40px 32px',
};

const notesTitle = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const notesText = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const footer = {
  padding: '0 40px 40px',
};

const footerDivider = {
  borderColor: '#e2e8f0',
  margin: '0 0 16px',
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};
