import nodemailer from 'nodemailer';

/**
 * Send welcome email to a newly registered client
 */
export async function sendWelcomeEmail({ email, name }) {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const storeName = process.env.STORE_NAME || 'Huellitas & Cía';
    const fromAddress = process.env.SMTP_FROM || `Huellitas & Cía <onboarding@resend.dev>`;

    if (!pass || pass.includes('tu_api_key_aqui')) {
      console.log('--- [MAILER DEV SIMULATION] ---');
      console.log(`To: ${email}`);
      console.log(`Subject: ¡Bienvenido/a a ${storeName}! 🎉`);
      console.log('Motivo: Clave SMTP_PASS no configurada en .env');
      console.log('-------------------------------');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
          .body { padding: 32px 24px; line-height: 1.6; }
          .welcome-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-top: 0; }
          .highlight-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 4px; }
          .button-container { text-align: center; margin: 32px 0 16px 0; }
          .btn { background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>¡Te damos la bienvenida a ${storeName}! 🐾</h1>
          </div>
          <div class="body">
            <h2 class="welcome-title">¡Hola, ${name}!</h2>
            <p>Estamos muy felices de que te hayas unido a nuestra comunidad. Tu cuenta ha sido creada exitosamente y ya puedes acceder a todos nuestros productos y servicios.</p>
            
            <div class="highlight-box">
              <strong style="color: #15803d;">¡Tu cuenta ya está lista!</strong>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534;">Puedes explorar nuestro catálogo, guardar tus favoritos y realizar tus compras de forma rápida y segura.</p>
            </div>

            <div class="button-container">
              <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Ir a la Tienda</a>
            </div>

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
          subject: `¡Bienvenido/a a ${storeName}! 🎉`,
          html: htmlContent
        })
      });

      const resData = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error('[MAILER RESEND ERROR]', resendResponse.status, JSON.stringify(resData, null, 2));
        return;
      }

      console.log(`[MAILER] Correo de bienvenida enviado a: ${email} (ID: ${resData.id})`);
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
      subject: `¡Bienvenido/a a ${storeName}! 🎉`,
      html: htmlContent
    });

    console.log(`[MAILER SMTP] Correo enviado a: ${email} (MessageId: ${info.messageId})`);
  } catch (error) {
    console.error('[MAILER ERROR Detallado]:', error);
  }
}
