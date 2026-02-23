import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

import { NextRequest } from "next/server";

import { prisma } from "@/server/db";
import { videoPath } from "@/server/uploads";

export const runtime = "nodejs";

function parseRange(range: string | null, size: number) {
  if (!range) return null;
  const m = /^bytes=(\d+)-(\d+)?$/.exec(range);
  if (!m) return null;

  const start = Number(m[1]);
  const end = m[2] ? Number(m[2]) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0 || end < start) return null;
  if (start >= size) return null;

  return { start, end: Math.min(end, size - 1) };
}

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

  const file = videoPath(video.fileKey);
  const info = await stat(file).catch(() => null);
  if (!info) return new Response("Not found", { status: 404 });

  const range = parseRange(req.headers.get("range"), info.size);
  const headers = new Headers();
  headers.set("Content-Type", video.mimeType || "application/octet-stream");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  if (!range) {
    headers.set("Content-Length", String(info.size));
    const stream = createReadStream(file);
    return new Response(Readable.toWeb(stream) as unknown as BodyInit, {
      status: 200,
      headers,
    });
  }

  const chunkSize = range.end - range.start + 1;
  headers.set("Content-Length", String(chunkSize));
  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${info.size}`);

  const stream = createReadStream(file, { start: range.start, end: range.end });
  return new Response(Readable.toWeb(stream) as unknown as BodyInit, {
    status: 206,
    headers,
  });
}

