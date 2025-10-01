# Configuración del Sistema de Envío de Emails

## Configuración Requerida

### 1. Variable de Entorno
Asegúrate de tener la siguiente variable en tu archivo `.env`:

```env
RESEND_API_KEY=tu_clave_api_de_resend
```

Para obtener tu API Key:
1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta o inicia sesión
3. Ve a la sección "API Keys"
4. Crea una nueva API Key
5. Cópiala y pégala en tu archivo `.env`

### 2. Dominio de Email
En el archivo `src/app/api/send-appointment-email/route.ts`, actualiza la línea:

```typescript
from: 'Urban Contractors <onboarding@resend.dev>'
```

Por tu dominio verificado en Resend:

```typescript
from: 'Urban Contractors <noreply@tudominio.com>'
```

### 3. Logo de la Empresa
En el archivo `src/components/emails/appointment-email-template.tsx`, actualiza la URL del logo:

```typescript
src="https://your-domain.com/Logo.png"
```

Por la URL pública de tu logo (puedes subirlo a Resend o usar tu dominio).

## Funcionalidades Implementadas

### 1. Botón de Ver Detalles (Ojo)
- Abre un diálogo modal con toda la información detallada de la cita
- Muestra datos del cliente, dirección completa, fecha, hora y notas
- Diseño moderno con tarjetas de colores organizadas por categoría

### 2. Botón de Enviar Email
- Envía un email de confirmación al cliente
- Template con diseño profesional y moderno
- Incluye:
  - Logo de la empresa
  - Detalles completos de la cita
  - Información de contacto
  - Notas importantes
  - Footer con información de la empresa

### 3. Indicadores Visuales
- Spinner de carga mientras se envía el email
- Toast de confirmación cuando el email se envía exitosamente
- Toast de error si algo falla
- Botones deshabilitados durante el envío para evitar duplicados

## Archivos Creados/Modificados

1. **src/app/api/send-appointment-email/route.ts** - API route para enviar emails
2. **src/components/emails/appointment-email-template.tsx** - Template del email
3. **src/app/[locale]/dashboard/pending-appointments/components/appointment-details-dialog.tsx** - Diálogo de detalles
4. **src/app/[locale]/dashboard/pending-appointments/components/pending-appointments.tsx** - Componente actualizado con los botones

## Próximos Pasos

1. Configura tu API Key de Resend en el archivo `.env`
2. Verifica tu dominio en Resend (opcional pero recomendado)
3. Actualiza el logo en el template del email
4. Prueba enviando un email de prueba
5. ¡Disfruta de la funcionalidad!

## Notas Importantes

- Los emails se envían de forma asíncrona para no bloquear la UI
- El botón se deshabilita mientras se envía el email
- Los errores se muestran al usuario mediante toasts
- El template es responsive y se ve bien en todos los dispositivos
