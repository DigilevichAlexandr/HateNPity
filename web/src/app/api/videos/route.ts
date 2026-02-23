import crypto from "node:crypto";
import { writeFile } from "node:fs/promises";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/server/db";
import { ensureVideosDir, guessVideoExtension, videoPath } from "@/server/uploads";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const formData = await req.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("file");

  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  if (!file.type.startsWith("video/")) {
    return NextResponse.json({ error: "file_must_be_video" }, { status: 400 });
  }

  if (file.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  await ensureVideosDir();

  const ext = guessVideoExtension(file.name, file.type);
  const fileKey = `${crypto.randomUUID()}${ext}`;
  await writeFile(videoPath(fileKey), Buffer.from(await file.arrayBuffer()));

  const created = await prisma.video.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      fileKey,
      mimeType: file.type || "application/octet-stream",
    },
    select: { id: true },
  });

  return NextResponse.redirect(new URL(`/video/${created.id}`, req.url));
}

