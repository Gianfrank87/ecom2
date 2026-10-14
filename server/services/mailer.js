import nodemailer from 'nodemailer';
import { dbGet } from '../db.js';
import { logger } from '../logger.js';
import { getFrontendUrl } from '../config/frontend.js';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getConfiguredStore = async () => {
  const defaults = {
    name: process.env.STORE_NAME || 'NigDiz',
    contactEmail: '',
    instagramUrl: '',
    footerText: 'Productos pensados para la seguridad, comodidad y felicidad de tus mascotas.',
  };

  try {
    const keys = {
      name: 'tienda_nombre',
      contactEmail: 'tienda_email_contacto',
      instagramUrl: 'tienda_instagram_url',
      footerText: 'tienda_footer_texto',
    };
    const entries = await Promise.all(Object.entries(keys).map(async ([field, key]) => {
      const row = await dbGet('SELECT valor FROM configuraciones WHERE clave = ?', [key]);
      return [field, row?.valor || defaults[field]];
    }));
    return { ...defaults, ...Object.fromEntries(entries) };
  } catch (error) {
    logger.warn('Mailer: no se pudo leer la configuración de tienda', error);
    return defaults;
  }
};

/**
 * Send welcome email to a newly registered client
 */
export async function sendWelcomeEmail({ email, name }) {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const store = await getConfiguredStore();
    const storeDisplayName = store.name;
    const storeName = escapeHtml(storeDisplayName);
    const clientName = escapeHtml(name);
    const footerText = escapeHtml(store.footerText);
    const contactEmail = escapeHtml(store.contactEmail);
    const instagramUrl = String(store.instagramUrl || '').startsWith('https://') ? store.instagramUrl : '';
    const fromAddress = process.env.SMTP_FROM || `NigDiz <onboarding@resend.dev>`;
    const storefrontUrl = escapeHtml(getFrontendUrl(process.env.FRONTEND_URL || process.env.CLIENT_URL));

    if (!pass || pass.includes('tu_api_key_aqui')) {
      logger.info('Mailer: envío simulado por falta de SMTP_PASS configurado', {
        recipientEmail: email,
        subject: `¡Bienvenido/a a ${storeDisplayName}!`,
      });
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4fbfd; margin: 0; padding: 20px; color: #352820; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #f0dc78; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(53,40,32,0.06); }
          .header { background: #352820; padding: 32px 24px; text-align: center; color: #f0dc78; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .body { padding: 32px 24px; line-height: 1.6; }
          .welcome-title { font-size: 20px; font-weight: 700; color: #352820; margin-top: 0; }
          .highlight-box { background: #fff9e6; border-left: 4px solid #d3ad2f; padding: 16px; margin: 24px 0; border-radius: 4px; }
          .button-container { text-align: center; margin: 32px 0 16px 0; }
          .btn { background-color: #d3ad2f; color: #352820 !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; display: inline-block; font-size: 15px; }
          .footer { background: #f4fbfd; padding: 20px; text-align: center; font-size: 12px; color: #4b382b; border-top: 1px solid #f0dc78; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>¡Te damos la bienvenida a ${storeName}! 🐾</h1>
          </div>
          <div class="body">
            <h2 class="welcome-title">¡Hola, ${clientName}!</h2>
            <p>Estamos muy felices de que te hayas unido a nuestra comunidad. Tu cuenta ha sido creada exitosamente y ya puedes acceder a todos nuestros productos y servicios.</p>
            
            <div class="highlight-box">
              <strong style="color: #705812;">¡Tu cuenta ya está lista!</strong>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #4b382b;">Podés explorar nuestro catálogo y realizar tus compras de forma rápida y segura.</p>
            </div>

            <div class="button-container">
              <a href="${storefrontUrl}" class="btn">Ir a la Tienda</a>
            </div>

            <p style="font-size: 13px; color: #4b382b;">${footerText}</p>
            ${contactEmail ? `<p style="font-size: 13px; color: #4b382b;">Contacto: ${contactEmail}</p>` : ''}
            ${instagramUrl ? `<p style="font-size: 13px;"><a style="color: #947516;" href="${instagramUrl}">Instagram de ${storeName}</a></p>` : ''}
            <p style="font-size: 13px; color: #64748b;">Si no realizaste este registro, por favor ignora este correo.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${storeName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Si la clave es de Resend (empieza por re_), podemos usar la API HTTP de Resend directamente (más rápida y sin bloqueos de puerto de red)
    if (pass.startsWith('re_')) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pass}`
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          subject: `¡Bienvenido/a a ${storeDisplayName}!`,
          html: htmlContent
        })
      });

      const resData = await resendResponse.json();

      if (!resendResponse.ok) {
        logger.error('Mailer: Resend rechazó el email', {
          statusCode: resendResponse.status,
          response: resData,
          recipientEmail: email,
        });
        return;
      }

      logger.info('Mailer: correo de bienvenida enviado por Resend', { recipientEmail: email, messageId: resData.id });
      return;
    }

    // Fallback a SMTP Estándar para otros proveedores (Gmail, etc.)
    const transporter = nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `¡Bienvenido/a a ${storeDisplayName}!`,
      html: htmlContent
    });

    logger.info('Mailer: correo de bienvenida enviado por SMTP', { recipientEmail: email, messageId: info.messageId });
  } catch (error) {
    logger.error('Mailer: error enviando correo de bienvenida', error);
  }
}
