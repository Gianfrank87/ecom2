import dotenv from 'dotenv';
import { sendWelcomeEmail } from './services/mailer.js';

dotenv.config();

console.log('Probando envío de email...');
console.log('SMTP_PASS presente:', Boolean(process.env.SMTP_PASS));
console.log('SMTP_PASS empieza con re_:', process.env.SMTP_PASS?.startsWith('re_'));
console.log('Remitente:', process.env.SMTP_FROM);

await sendWelcomeEmail({
  email: 'gianfrank87@gmail.com',
  name: 'Gian'
});

console.log('Prueba finalizada.');
