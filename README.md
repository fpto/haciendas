# 🐄 Nueva Joya — Gestión Ganadera

Aplicación de gestión de la hacienda ganadera **Nueva Joya**: animales, lotes,
potreros, pesos y ventas, con estadísticas de rendimiento (GDP, ROI, scores de
potreros).

> El sistema gestiona una única hacienda (Nueva Joya). El nombre vive en
> `src/lib/brand.ts` y se aplica automáticamente a cada registro; no hay
> selector ni campo de hacienda en los formularios.

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
- Si ya existe un potrero con ese número se **actualiza**; si no, se **crea**.

## 📍 Corrales (ubicación puntual)

A diferencia de un **potrero** (un polígono con linderos), un **corral** es una
**ubicación puntual** definida por **latitud y longitud**. Los lotes de ganado
pueden asignarse a un corral igual que a un potrero (un lote puede tener
potrero, corral, ambos o ninguno).

Desde **Corrales** puedes crear, editar y eliminar corrales, y ver su ubicación
en un mapa satelital con un marcador. La ficha de cada corral muestra los lotes
asignados y el total de cabezas.

Desde **Corrales → Importar KMZ** puedes subir un archivo `.kmz` o `.kml` de
Google Earth. Cada **punto/marcador** se convierte en un corral:

- El **nombre** del punto se usa como número de corral.
- Las **coordenadas** del punto se guardan como latitud y longitud.
- Si ya existe un corral con ese número se **actualiza**; si no, se **crea**.

> Migración de BD: si ya tienes la base de datos creada, aplica
> `prisma/neon-corrals.sql` en el SQL Editor de Neon (o corre `npm run db:push`)
> para agregar la tabla `corrals` y la columna `lots.corral_id`.

## ⚖️ Unidad de peso (kg / lb)

La app puede mostrar y capturar pesos en **kilogramos** o **libras**, con
**libras como unidad por defecto**. El conmutador está en la barra de
navegación. Internamente los pesos se almacenan siempre en kilogramos; la
conversión se aplica solo a la visualización y la captura. Los importes en
dinero (precio por libra, totales) no cambian con la unidad.

## ⚙️ Configuración (modo de medición de peso)

El modo de medición de peso se elige en **Configuración** (solo administradores):

- **Por Lote**: se registra el peso promedio del lote completo en cada pesada.
- **Por Animal**: se registra el peso individual de cada animal.

El valor se guarda en `haciendas.weight_mode` y aplica a toda la operación.

## 🏷️ Estado y venta del lote (modo Por Lote)

Con el modo **Por Lote** activo, cada lote tiene un **estado**:

- **En crecimiento** (`growing`): el lote sigue en engorde. Es el estado por
  defecto y el único que cuenta como **inventario activo** en las métricas de
  bovinos del tablero y en el número de cabezas del mapa de potreros.
- **Vendido** (`sold`): al marcar el lote como vendido se capturan los **datos de
  la venta** (fecha, comprador, precio por kg y comentario). El total de la venta
  se calcula con el peso total del último pesado (peso promedio × cabezas) por el
  precio por kg.
- **Destruido** (`destroyed`): el lote se dio de baja (muerte, decomiso u otra
  pérdida) y deja el inventario activo.

El estado se elige al crear o editar un lote y se muestra como etiqueta en la
lista y en la ficha del lote.

En modo Por Lote la sección **Ventas** trabaja por lote (no por animales): lista
los lotes vendidos y, desde **Vender lote**, permite **elegir un lote en
crecimiento** y capturar la venta, lo que marca el lote como vendido. También se
puede vender desde el botón **Vender lote** de la ficha del lote. La función de
venta por animales (con ROI) solo aparece con el modo Por Animal.
El detalle de cada venta por lote vive en la ficha del lote, y la tarjeta
**Ventas** del tablero cuenta los lotes vendidos.

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
