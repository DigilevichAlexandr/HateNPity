import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";

import { ensureVideosDir, safeFileKey, videoPath } from "@/server/uploads";

type StorageDriver = "local" | "s3";

type VideoFile = {
  fileKey: string;
  mimeType: string;
};

function storageDriver(): StorageDriver {
  return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";
}

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

async function saveToLocal(file: VideoFile, data: Buffer) {
  await ensureVideosDir();
  await writeFile(videoPath(file.fileKey), data);
}

async function serveFromLocal(req: NextRequest, file: VideoFile) {
  const path = videoPath(file.fileKey);
  const info = await stat(path).catch(() => null);
  if (!info) return new Response("Not found", { status: 404 });

  const range = parseRange(req.headers.get("range"), info.size);
  const headers = new Headers();
  headers.set("Content-Type", file.mimeType || "application/octet-stream");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  if (!range) {
    headers.set("Content-Length", String(info.size));
    const stream = createReadStream(path);
    return new Response(Readable.toWeb(stream) as unknown as BodyInit, {
      status: 200,
      headers,
    });
  }

  const chunkSize = range.end - range.start + 1;
  headers.set("Content-Length", String(chunkSize));
  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${info.size}`);
  const stream = createReadStream(path, { start: range.start, end: range.end });
  return new Response(Readable.toWeb(stream) as unknown as BodyInit, {
    status: 206,
    headers,
  });
}

function trimSlashes(s: string) {
  return s.replace(/^\/+|\/+$/g, "");
}

function s3ObjectKey(fileKey: string) {
  const key = safeFileKey(fileKey);
  const prefix = trimSlashes(process.env.S3_KEY_PREFIX || "videos");
  return prefix ? `${prefix}/${key}` : key;
}

function s3SignedUrlTtl() {
  const raw = Number(process.env.S3_SIGNED_URL_TTL_SECONDS ?? "900");
  if (!Number.isFinite(raw)) return 900;
  return Math.min(Math.max(Math.floor(raw), 60), 3600);
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const globalForStorage = globalThis as unknown as { s3Client?: S3Client };

function getS3Client() {
  if (globalForStorage.s3Client) return globalForStorage.s3Client;

  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();

  const client = new S3Client({
    region: process.env.S3_REGION?.trim() || "auto",
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials:
      accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });

  if (process.env.NODE_ENV !== "production") globalForStorage.s3Client = client;
  return client;
}

async function saveToS3(file: VideoFile, data: Buffer) {
  const client = getS3Client();
  const bucket = requireEnv("S3_BUCKET");
  const key = s3ObjectKey(file.fileKey);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: file.mimeType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

async function serveFromS3(file: VideoFile) {
  const client = getS3Client();
  const bucket = requireEnv("S3_BUCKET");
  const key = s3ObjectKey(file.fileKey);

  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: file.mimeType || "application/octet-stream",
    }),
    { expiresIn: s3SignedUrlTtl() },
  );

  return Response.redirect(signedUrl, 307);
}

export async function saveVideoFile(file: VideoFile, data: Buffer) {
  if (storageDriver() === "s3") return saveToS3(file, data);
  return saveToLocal(file, data);
}

export async function serveVideoFile(req: NextRequest, file: VideoFile) {
  if (storageDriver() === "s3") return serveFromS3(file);
  return serveFromLocal(req, file);
}

