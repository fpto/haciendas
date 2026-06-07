"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin, getCurrentUser, ROLES, type Role } from "@/lib/auth";
import { str } from "@/actions/helpers";

const MIN_PASSWORD_LENGTH = 6;

function normalizeRole(value: string | null): Role {
  return ROLES.includes(value as Role) ? (value as Role) : "viewer";
}

function userData(formData: FormData) {
  return {
    firstName: str(formData.get("first_name")),
    lastName: str(formData.get("last_name")),
    email: str(formData.get("email")),
    password: str(formData.get("password")),
    role: normalizeRole(str(formData.get("role"))),
  };
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const data = userData(formData);

  if (!data.email) {
    redirect("/usuarios/new?error=El correo electrónico es obligatorio");
  }
  if (!data.password || data.password.length < MIN_PASSWORD_LENGTH) {
    redirect(
      `/usuarios/new?error=La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    );
  }
  const existing = await prisma.user.findFirst({
    where: { email: { equals: data.email, mode: "insensitive" } },
  });
  if (existing) {
    redirect("/usuarios/new?error=Ya existe un usuario con ese correo");
  }

  const passwordDigest = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      passwordDigest,
    },
  });
  revalidatePath("/usuarios");
  redirect(`/usuarios?notice=Usuario ${user.email} creado correctamente`);
}

export async function updateUser(id: number, formData: FormData) {
  await requireAdmin();
  const data = userData(formData);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/usuarios?error=El usuario ya no existe");
  }

  if (!data.email) {
    redirect(`/usuarios/${id}/edit?error=El correo electrónico es obligatorio`);
  }
  const clash = await prisma.user.findFirst({
    where: {
      email: { equals: data.email, mode: "insensitive" },
      NOT: { id },
    },
  });
  if (clash) {
    redirect(`/usuarios/${id}/edit?error=Ya existe otro usuario con ese correo`);
  }

  // No permitir degradar al último administrador (se quedaría sin gestión).
  if (target!.role === "admin" && data.role !== "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) {
      redirect(
        `/usuarios/${id}/edit?error=Debe existir al menos un administrador`,
      );
    }
  }

  const updateData: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: Role;
    passwordDigest?: string;
  } = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role,
  };

  // La contraseña solo se cambia si se proporcionó una nueva.
  if (data.password) {
    if (data.password.length < MIN_PASSWORD_LENGTH) {
      redirect(
        `/usuarios/${id}/edit?error=La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      );
    }
    updateData.passwordDigest = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({ where: { id }, data: updateData });
  revalidatePath("/usuarios");
  redirect(`/usuarios?notice=Usuario actualizado correctamente`);
}

export async function deleteUser(formData: FormData) {
  const current = await requireAdmin();
  const id = Number(formData.get("id"));

  // Un administrador no puede eliminar su propia cuenta.
  if (id === current.id) {
    redirect("/usuarios?error=No puedes eliminar tu propio usuario");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/usuarios?error=El usuario ya no existe");
  }

  // No permitir eliminar al último administrador.
  if (target!.role === "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) {
      redirect("/usuarios?error=Debe existir al menos un administrador");
    }
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/usuarios");
  redirect("/usuarios?notice=Usuario eliminado");
}
