import { NextRequest } from "next/server";

import { prisma } from "@/server/db";
import { serveVideoFile } from "@/server/storage";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    select: { fileKey: true, mimeType: true },
  });

  if (!video) return new Response("Not found", { status: 404 });
  return serveVideoFile(req, video);
}

