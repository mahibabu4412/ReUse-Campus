import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function detectExtension(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 6 && (buf.subarray(0, 6).toString() === "GIF87a" || buf.subarray(0, 6).toString() === "GIF89a")) return "gif";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

/** Validate by magic bytes (never trust the client-supplied MIME type) and store safely. */
export async function saveUpload(
  file: File | null | undefined,
  folder: "listings" | "profiles" = "listings"
): Promise<string | null> {
  if (!file || typeof file.arrayBuffer !== "function") return null;
  if (file.size === 0 || file.size > MAX_BYTES) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectExtension(buffer);
  if (!ext) return null;

  const filename = `${randomUUID()}.${ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    // Serverless deployments have a read-only filesystem. Persist uploads to
    // Vercel Blob and store the public URL instead of a local path.
    const blob = await put(`${folder}/${filename}`, buffer, {
      access: "public",
      token,
      contentType: CONTENT_TYPES[ext],
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer, { flag: "wx" });
  return `uploads/${folder}/${filename}`;
}

export async function saveManyUploads(files: File[], folder: "listings" = "listings") {
  const paths: string[] = [];
  for (const file of files.slice(0, 5)) {
    const saved = await saveUpload(file, folder);
    if (saved) paths.push(saved);
  }
  return paths;
}
