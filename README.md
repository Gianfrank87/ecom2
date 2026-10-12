# NigDiz

Tienda online para mascotas hecha con React + Vite en el frontend y Node.js + Express + PostgreSQL en el backend.

## Desarrollo local

```bash
npm run dev:local
```

Ese comando prepara PostgreSQL local aislado en `127.0.0.1:55432/nigdiz_local`, levanta la API en `http://localhost:5000` y abre Vite en `http://localhost:5173`.

## Comandos útiles

```bash
npm run local:setup
npm run dev:server:local
npm run local:stop
npm run build
npm run lint
```

Los secretos, datos locales y comprobantes privados quedan fuera de Git mediante `.gitignore`.
