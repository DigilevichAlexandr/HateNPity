import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/server/db";
import { hashPassword } from "@/server/password";

export const runtime = "nodejs";

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@") || password.length < 8) {
    return NextResponse.redirect(new URL("/signup?error=invalid", req.url));
  }

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) {
    return NextResponse.redirect(new URL("/signup?error=email_taken", req.url));
  }

  const passwordHash = await hashPassword(password);
  try {
    await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/signup?error=email_taken", req.url));
  }

  return NextResponse.redirect(new URL("/signin?created=1", req.url));
}

