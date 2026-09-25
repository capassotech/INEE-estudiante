const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

const IMAGE_SIGNATURES: ReadonlyArray<{ mime: string; bytes: readonly number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
];

function matchesSignature(header: Uint8Array, signature: readonly number[]): boolean {
  if (header.length < signature.length) return false;
  return signature.every((byte, index) => header[index] === byte);
}

function isWebP(header: Uint8Array): boolean {
  if (header.length < 12) return false;
  return (
    matchesSignature(header, [0x52, 0x49, 0x46, 0x46]) &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  );
}

function detectImageMimeFromHeader(header: Uint8Array): string | null {
  for (const { mime, bytes } of IMAGE_SIGNATURES) {
    if (matchesSignature(header, bytes)) return mime;
  }
  if (isWebP(header)) return "image/webp";
  return null;
}

export type ImageFileValidationResult =
  | { valid: true; mimeType: string }
  | { valid: false; error: string };

export async function validateImageFile(file: File): Promise<ImageFileValidationResult> {
  if (file.size === 0) {
    return { valid: false, error: "El archivo está vacío" };
  }

  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    return { valid: false, error: "La imagen no debe superar 5 MB" };
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const mimeType = detectImageMimeFromHeader(header);

  if (!mimeType) {
    return {
      valid: false,
      error: "Selecciona un archivo de imagen válido (JPEG, PNG, WebP o GIF)",
    };
  }

  return { valid: true, mimeType };
}
