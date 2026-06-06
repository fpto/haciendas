import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";

// El login se implementa como Route Handler (no Server Action) para que siempre
// se ejecute en contexto de request al escribir la cookie de sesión, sin depender
// de la verificación de origen de las Server Actions detrás de proxies.
export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=Correo o contraseña inválidos", request.url),
      { status: 303 },
    );
  }
  await createSession(user);
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
