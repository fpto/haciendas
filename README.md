# 🐄 Haciendas — Gestión Ganadera

Aplicación de gestión de haciendas ganaderas: animales, lotes, potreros, pesos y
ventas, con estadísticas de rendimiento (GDP, ROI, scores de potreros).

Reescrita desde la app original de **Ruby on Rails** a **Next.js** para desplegar
de forma nativa en **Vercel**, con una interfaz **moderna y mobile-first**.

## 🧱 Stack

| Capa            | Tecnología                                  |
| --------------- | ------------------------------------------- |
| Framework       | Next.js 15 (App Router) + React 19          |
| Lenguaje        | TypeScript                                   |
| UI              | Tailwind CSS v4 (mobile-first)              |
| Base de datos   | PostgreSQL (Neon serverless)               |
| ORM             | Prisma 6                                     |
| Autenticación   | Sesiones JWT (cookie httpOnly) + bcrypt     |
| Despliegue      | Vercel                                       |

## 🚀 Puesta en marcha local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea tu base de datos en [Neon](https://neon.tech) y copia las variables:

   ```bash
   cp .env.example .env
   # edita .env con tu DATABASE_URL / DIRECT_URL y un AUTH_SECRET
   ```

   Genera el secreto de sesión:

   ```bash
   openssl rand -base64 32
   ```

3. Crea el esquema y un usuario administrador:

   ```bash
   npm run db:push
   npm run db:seed
   ```

   Credenciales por defecto del seed: `admin@haciendashn.com` / `haciendas123`
   (personalízalas con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`).

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre http://localhost:3000

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub e impórtalo en Vercel (detecta Next.js solo).
2. En **Settings → Environment Variables** agrega:
   - `DATABASE_URL` — cadena *pooled* de Neon (`...-pooler...`).
   - `DIRECT_URL` — cadena directa de Neon (para migraciones).
   - `AUTH_SECRET` — secreto aleatorio para firmar sesiones.
3. El `buildCommand` ya ejecuta `prisma generate && next build`.
4. La primera vez, aplica el esquema desde tu máquina apuntando a la BD de
   producción: `npm run db:push && npm run db:seed`.

## 🗂️ Estructura

```
prisma/schema.prisma      Esquema (tablas/columnas snake_case heredadas de Rails)
src/lib/queries.ts        Consultas SQL crudas: GDP, ROI, stats de lotes y potreros
src/lib/auth.ts           Sesiones, roles (admin/lector) y verificación bcrypt
src/actions/              Server Actions (CRUD) por entidad
src/components/           UI mobile-first (AppShell, tarjetas, tablas, formularios)
src/app/(app)/            Páginas protegidas (tablero + entidades)
src/app/login/            Inicio de sesión
```

## 🌎 Importar potreros desde Google Earth (KMZ/KML)

Desde **Potreros → Importar KMZ** puedes subir un archivo `.kmz` o `.kml`
exportado de Google Earth. Cada polígono se convierte en un potrero:

- El **nombre** del polígono se usa como número de potrero.
- El **área en hectáreas** se calcula automáticamente (geodésica).
- Los **linderos** se guardan como GeoJSON en el campo `boundaries`.
- Si ya existe un potrero con ese número (y misma hacienda) se **actualiza**;
  si no, se **crea**.

## ⚖️ Unidad de peso (kg / lb)

La app puede mostrar y capturar pesos en **kilogramos** o **libras**, con
**libras como unidad por defecto**. El conmutador está en la barra de
navegación. Internamente los pesos se almacenan siempre en kilogramos; la
conversión se aplica solo a la visualización y la captura. Los importes en
dinero ($/kg, totales) no cambian con la unidad.

## 🔐 Roles y usuarios

La aplicación maneja **dos tipos de usuario**:

- **Administrador** (`admin`): acceso total. Puede ver, crear, editar y eliminar
  registros, y además **gestionar usuarios** (crear, editar y eliminar cuentas).
- **Lector** (`viewer`): solo lectura. Ve toda la información de la aplicación
  pero no puede crear, editar ni eliminar nada; los botones de acción se ocultan
  automáticamente.

Los administradores gestionan las cuentas desde **Usuarios** en el menú lateral
(`/usuarios`), donde pueden dar de alta lectores u otros administradores y
restablecer contraseñas. Por seguridad, siempre debe existir al menos un
administrador (no es posible eliminar ni degradar el último) y nadie puede
eliminar su propia cuenta.

> Nota: el rol histórico `editor` (crear/editar sin eliminar) heredado de la app
> original sigue siendo válido a nivel de permisos, pero la gestión de usuarios
> solo ofrece **Administrador** y **Lector**.

Las estadísticas de bovinos consideran únicamente animales con estatus
`engorde`, calculadas a partir de sus dos pesos más recientes.
