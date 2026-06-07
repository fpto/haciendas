import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "haciendas_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Falta la variable de entorno AUTH_SECRET. Genera una con `openssl rand -base64 32`.",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

// Roles soportados por la aplicación:
//   - admin:  acceso total (ver, crear, editar y eliminar + gestión de usuarios).
//   - viewer: solo lectura (el "lector"); ve toda la información pero no modifica.
// El rol histórico "editor" (crear/editar pero no eliminar) sigue siendo válido
// por compatibilidad, pero la interfaz de usuarios solo ofrece admin y viewer.
export const ROLES = ["admin", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Lector",
};

export function roleLabel(role: string | null | undefined): string {
  return ROLE_LABELS[role ?? "viewer"] ?? "Lector";
}

export function isEditor(role: string | null | undefined): boolean {
  return role === "editor" || role === "admin";
}

export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

// Verifica credenciales contra el password_digest (bcrypt) heredado de Rails.
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!user || !user.passwordDigest) return null;
  const ok = await bcrypt.compare(password, user.passwordDigest);
  if (!ok) return null;
  return {
    id: user.id,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    role: user.role ?? "viewer",
  };
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.user as SessionUser) ?? null;
  } catch {
    return null;
  }
}

// Helpers para usar dentro de Server Actions / páginas protegidas.
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireEditor(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isEditor(user.role)) redirect("/acceso-denegado");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isAdmin(user.role)) redirect("/acceso-denegado");
  return user;
}
