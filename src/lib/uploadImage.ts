import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError("JPG, PNG, GIF, WebP 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_SIZE) {
    throw new UploadError("파일 크기는 5MB 이하여야 합니다.");
  }
}

/**
 * Upload an image to Supabase Storage and return the public URL.
 * @param file - The file to upload
 * @param folder - Storage path prefix, e.g. "covers/{novelId}" or "chapters/{novelId}/{chapterId}"
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  validateFile(file);

  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw new UploadError(error.message);
  }

  const { data: urlData } = supabase.storage
    .from("images")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage by its public URL.
 */
export async function deleteImage(publicUrl: string): Promise<void> {
  const supabase = createClient();
  // Extract path after /object/public/images/
  const marker = "/object/public/images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);

  await supabase.storage.from("images").remove([path]);
}
