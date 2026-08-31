# Necesarios para llevar Huellitas & Cía a producción real

## 1) Resumen ejecutivo

Este proyecto actual tiene una base funcional con:
- Frontend React + Vite
- Backend Express + Node.js
- Base de datos SQLite local
- Autenticación JWT
- Carrito, pedidos, ofertas, mensajes y admin

Para ponerlo en producción real, no alcanza con “subir a GitHub” ni dejarlo corriendo en localhost. Necesitamos:
- hosting para frontend
- hosting para backend
- base de datos real y persistente
- dominio + DNS
- SSL
- variables de entorno
- seguridad y validación
- backups y monitoreo
- flujo de deploy con CI/CD

La recomendación práctica para este proyecto es:
- Frontend: Vercel o Netlify
- Backend: Render, Railway o VPS Ubuntu/Docker
- Base de datos: PostgreSQL (recomendado), o MySQL si querés mantener compatibilidad con SQLite-ish pero mejor PostgreSQL
- Storage de imágenes: Cloudinary, Supabase Storage o Google Cloud Storage
- Emails: Resend / Brevo / SendGrid
- Dominio: Namecheap / Cloudflare / Porkbun
- Reverse proxy y SSL: Cloudflare + LetsEncrypt si usás VPS o el provider lo ofrece si usás PaaS

---

## 2) Arquitectura recomendada para producción

### Opción A: recomendada (simple y robusta)

Frontend:
- Vercel
- build de React/Vite
- variables públicas como VITE_API_URL
- CDN global, SSL gratis

Backend:
- Render o Railway
- Node.js + Express
- puerto 3000 o 5000 según entorno
- conexión a PostgreSQL
- JWT con SECRET_REAL

Base de datos:
- PostgreSQL managed
- tablas: clientes, pedidos, productos, categorias, ofertas, mensajes, etc.
- backups automáticos

Storage de imágenes:
- Cloudinary o Supabase Storage
- URLs públicas para product images

Email:
- Resend para confirmación de registro, notificaciones y recuperación de contraseña

DNS / dominio:
- Cloudflare para manager DNS
- SSL gratis
- redirección www -> apex o viceversa

### Opción B: si querés todo en un solo VPS

- VPS Ubuntu con Docker Compose
- Nginx como proxy reverso
- Node.js backend
- PostgreSQL en contenedor o servicio externo
- frontend build estático servido por Nginx
- monitoreo básico con PM2 o Docker

Esto sirve si querés más control, pero requiere más mantenimiento.

---

## 3) Qué hay que cambiar del proyecto para producción

### 3.1 SQLite -> PostgreSQL (obligatorio para web real)

SQLite es ideal para local o prototipo, pero no es la mejor opción para producción web con varios usuarios, backups, concurrencia y estabilidad.

Cosas a migrar:
- usar `pg` o `postgres` para Node
- cambiar queries que son SQLite-specific
- revisar tipos de datos y serials/autoincrement
- definir schema real para todas las tablas
- implementar migraciones con Prisma, Knex o SQL puro

Recomendación:
- Prisma para mantener esquema, migraciones y queries más clean
- o Knex + SQL migraciones manuales si querés algo más ligero

Si querés seguir con SQL “a mano”, también sirve, pero conviene Prisma por velocidad y seguridad.

### 3.2 Peticiones del frontend

El frontend usa URLs locales (`localhost:5000` o similar). En producción el frontend debe apuntar a la URL real del backend, por ejemplo:
- https://api.huellitas.com.ar
- o https://huellitas-backend.onrender.com

Esto se hace por variable de entorno:
- `VITE_API_URL` en frontend

### 3.3 Login y JWT

Necesitan:
- JWT_SECRET fuerte
- expiración real (ej. 7 días)
- cookies o authorization headers seguros
- CORS restringido a dominios reales

La sesión actual parece persistir en localStorage, lo cual es funcional pero no ideal para seguridad. Para producción, conviene revisar la estrategia:
- JWT en cookie HttpOnly + Secure + SameSite=Lax/Strict
- o token en localStorage si se quiere simplicity, pero con cuidado

### 3.4 Archivos y uploads

Si se van a subir comprobantes de pago, fotos, etc., no conviene guardar archivos en el backend local. Recomendación:
- Cloudinary
- Supabase Storage
- Google Cloud Storage

Esto permite:
- optimización de imágenes
- links públicos seguros
- menos carga en el servidor

### 3.5 Emails

Para registro, pedidos y mensajes, hace falta un servicio de email real:
- Resend
- Brevo
- SendGrid
- Nodemailer + SMTP de proveedor

Recomendado para este proyecto:
- Resend para confirmación de registro y notificaciones

---

## 4) Stack técnico recomendado para este proyecto

### Frontend
- React 19 + Vite
- React Router
- Tailwind
- deployment en Vercel

### Backend
- Node.js + Express
- JWT auth
- CORS
- endpoints REST
- deployment en Render/Railway/VPS

### Base de datos
- PostgreSQL
- Prisma o Knex
- backups automáticos

### Storage
- Cloudinary o Supabase Storage

### Email
- Resend

### Dominio
- Cloudflare + DNS

### Monitoreo
- Sentry (frontend/backend)
- Uptime monitoring (UptimeRobot / Better Stack)
- logs del backend

---

## 5) Configuración de entorno

### Variables de entorno para backend

Necesitas un `.env` o equivalente en entorno de producción con algo así:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/huellitas
JWT_SECRET=super_secret_key_muy_larga
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://huellitas.com.ar
CLIENT_URL=https://huellitas.com.ar
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
RESEND_API_KEY=
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Variables de entorno para frontend

```env
VITE_API_URL=https://api.huellitas.com.ar
VITE_APP_NAME=Huellitas & Cía
```

### Config importante
- nunca commitear `.env`
- usar `.env.example` para documentar variables
- separar desarrollo / staging / producción

---

## 6) Hosting recomendado por pieza

### Frontend: Vercel

Ventajas:
- despliegue simple
- SSL gratis
- red global CDN
- integración con GitHub
- ideal para Vite

Se recomienda:
- GitHub conectado a Vercel
- deploy automático por push a `main`
- dominio custom

### Backend: Render

Ventajas:
- deploy de Node.js fácil
- variables de entorno
- auto deploy desde GitHub
- health checks
- buena relación costo/beneficio

Alternativas:
- Railway
- Fly.io
- DigitalOcean App Platform
- VPS Ubuntu + Docker

### Base de datos: Neon / Supabase / Railway / DigitalOcean

Recomendación principal:
- Neon (Postgres serverless) o Supabase Postgres
- Railway Postgres si querés un entorno más integrado

Ventajas:
- backup automático
- fácil gestión
- no tenés que operar un servidor de DB

### Dominio y DNS: Cloudflare

Setear:
- A / CNAME para frontend
- A / CNAME para backend
- TLS/SSL Always Use HTTPS
- WAF / rate limiting opcional

---

## 7) Infraestructura mínima para que esto funcione bien

### Debe existir:
- un dominio principal
- frontend deployado
- backend deployado
- base de datos persistente
- variables de entorno configuradas
- SSL funcionando
- servicio de email configurado
- backup de DB

### Opcional pero recomendado:
- error tracking (Sentry)
- Uptime monitoring
- logs centralizados
- file storage externo
- CDN por Cloudflare
- rate limiting y revisiones de seguridad

---

## 8) Seguridad mínima requerida

Antes de subirlo a producción, revisar esto:

- JWT_SECRET fuerte y secreto
- no guardar passwords en texto plano
- CORS restringido
- headers de seguridad
- sanitizar inputs
- validar upload de archivos
- limitar tamaño de imágenes / PDFs
- no exponer endpoints admin sin auth
- usar HTTPS únicamente
- no dejar debug logs en producción
- revisar permisos de archivos y dirs

### Recomendaciones extras
- Helmet para Express
- rate limiting (express-rate-limit)
- validación con Joi/Zod
- logging con Winston / Pino

---

## 9) Recomendación concreta de despliegue para este proyecto

### La mejor opción para este caso

Frontend:
- Vercel

Backend:
- Render

DB:
- Neon / Supabase Postgres

Email:
- Resend

Imágenes:
- Cloudinary

Dominio:
- Cloudflare

Arquitectura:
- Frontend: https://huellitas.com.ar
- API: https://api.huellitas.com.ar
- DB: PostgreSQL managed

Esto es un stack muy normalizado y realmente viable para una tienda pet shop.

---

## 10) Mapeo del proyecto actual a producción

### Frontend actual
- React + Vite + Tailwind
- compatible con Vercel sin grandes cambios
- solo hace falta setear la URL del backend

### Backend actual
- Express + SQLite
- requiere migración de DB y configuración de entorno
- hay que pasar a PostgreSQL
- revisar JWT, auth, CORS y endpoints admin

### Datos que conviene mover a producción
- productos
- clientes
- pedidos
- items de pedido
- ofertas
- mensajes
- stock y estados

---

## 11) Plan de migración recomendado

### Fase 1: infraestructura
- crear cuenta en Vercel/Render/Cloudflare
- crear DB PostgreSQL
- configurar dominio
- preparar variables de entorno

### Fase 2: migrate del backend
- levantar esquema en PostgreSQL
- pasar datos iniciales
- ajustar endpoints del backend
- testear auth y pedido flow

### Fase 3: frontend
- cambiar URLs de API a producción
- deploy en Vercel
- probar login, catálogo, carrito, tareas administrativas

### Fase 4: producción real
- activar SSL
- testear flujo completo compra
- activar email de confirmación
- activar backups y monitoreo

### Fase 5: hardening
- Sentry
- rate limiting
- redes de seguridad
- revisión final de seguridad

---

## 12) Presupuesto orientativo (aprox.)

Esto es solo referencia, varía por país y proveedor:

- Dominio: $10–30 USD/año
- Vercel: $0–20 USD/mes dependiendo de uso
- Render/Railway: $7–30 USD/mes
- PostgreSQL managed: $10–40 USD/mes
- Cloudinary: $0–20 USD/mes según volumen
- Resend/SMTP: $0–20 USD/mes
- Cloudflare: $0–20 USD/mes

Total realista para proyecto pequeño/mediano:
- entre $30 y $100 USD/mes según crecimiento

---

## 13) Recomendación final de arquitectura

Si el objetivo es que esto funcione bien en la web real y no “hacerlo correr otra vez en local”, la recomendación es:

- Frontend: Vercel
- Backend: Render o Railway
- Base de datos: PostgreSQL managed (Neon/Supabase/Railway)
- Email: Resend
- Storage: Cloudinary
- Dominio: Cloudflare
- SSL: gratis por proveedor/dominio
- Monitoreo: Sentry + UptimeRobot

Esta es la setup más segura y rápida para un proyecto como este.

---

## 14) Prompt listo para pasarle a otra IA

Se puede tomar este texto y pedírselos a una IA externa de la siguiente manera:

> Quiero llevar mi proyecto React + Express + SQLite a producción real. El frontend está en Vite, el backend en Node/Express, y la app incluye login, carrito, pedidos, ofertas, mensajes y panel admin. Necesito que me guiés paso a paso para ponerlo en producción con: hosting del frontend, hosting del backend, base de datos real, dominio, SSL, variables de entorno, seguridad, emails, uploads de imágenes/comprobantes, backups y deploy. Quiero la recomendación más realista para un e-commerce pequeño/mediano. Mi objetivo es que funcione en una web real, no solo localmente. Necesito una arquitectura clara, costos estimados, opciones de proveedores y un plan de migración desde SQLite a PostgreSQL.

---

## 15) Importante para no caer en errores

No conviene para producción:
- SQLite como base de datos principal
- dejar el backend con localhost en el frontend
- guardar archivos importantes en el servidor sin storage externo
- no tener SSL / dominio real
- no separar entorno dev/staging/prod
- no configurar backups
- no separar auth/admin de forma robusta

---

## 16) Cierre

Este proyecto sí tiene estructura para convertirse en una tienda real, pero requiere la migración de varios puntos clave antes de publicarlo. El mayor punto crítico es pasar de SQLite a PostgreSQL y separar frontend/backend con hosting real, dominio y variables de entorno configuradas.

Si se hace bien, esto puede salir como una web e-commerce funcional, estable y escalable.
