import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export async function saveUpload(
  file: File,
  subfolder: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : ".jpg";
  const filename = `${randomBytes(16).toString("hex")}${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, buffer);
  return `/uploads/${subfolder}/${filename}`;
}

export async function readUpload(relativePath: string): Promise<Buffer | null> {
  if (!relativePath.startsWith("/uploads/")) return null;
  const fullPath = path.join(process.cwd(), "public", relativePath);
  try {
    const { readFile } = await import("fs/promises");
    return await readFile(fullPath);
  } catch {
    return null;
  }
}
