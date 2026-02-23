import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const { id } = await params;
  const formData = await req.formData();
  const text = String(formData.get("text") ?? "").trim();

  if (!text) {
    return NextResponse.redirect(new URL(`/video/${id}`, req.url));
  }

  const exists = await prisma.video.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return new Response("Not found", { status: 404 });

  await prisma.comment.create({
    data: {
      videoId: id,
      userId: session.user.id,
      text: text.slice(0, 500),
    },
  });

  return NextResponse.redirect(new URL(`/video/${id}`, req.url));
}

