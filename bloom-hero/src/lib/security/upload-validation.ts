export const PROFILE_PHOTO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export function validateImageUpload(
  file: File,
  options: {
    allowedMimeTypes: readonly string[];
    maxBytes: number;
  },
): string | null {
  if (file.size <= 0) {
    return "File is required.";
  }

  if (file.size > options.maxBytes) {
    return `File size must be under ${Math.round(options.maxBytes / (1024 * 1024))} MB.`;
  }

  if (!options.allowedMimeTypes.includes(file.type)) {
    return "Unsupported image type.";
  }

  return null;
}
