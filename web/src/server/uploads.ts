import { mkdir } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_ROOT = path.join(process.cwd(), "var", "uploads");
const VIDEOS_DIR = path.join(UPLOAD_ROOT, "videos");

export async function ensureVideosDir() {
  await mkdir(VIDEOS_DIR, { recursive: true });
  return VIDEOS_DIR;
}

export function safeFileKey(fileKey: string) {
  const base = path.basename(fileKey);
  if (base !== fileKey) throw new Error("Invalid file key");
  return base;
}

export function videoPath(fileKey: string) {
  return path.join(VIDEOS_DIR, safeFileKey(fileKey));
}

export function guessVideoExtension(filename: string, mimeType: string) {
  const ext = path.extname(filename).toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/.test(ext)) return ext;
  if (mimeType === "video/mp4") return ".mp4";
  if (mimeType === "video/webm") return ".webm";
  return "";
}

