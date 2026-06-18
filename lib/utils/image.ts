// ============================================================
// Client-side image compression (browser Canvas API — no deps)
// Resizes large images down to a max dimension and re-encodes them
// (WebP when supported) before upload. Typically cuts file size 70–90%,
// saving Supabase storage AND egress on the free tier.
// ============================================================

export type CompressOptions = {
  maxWidth?: number;   // longest-edge cap in px
  maxHeight?: number;
  quality?: number;    // 0..1
  mimeType?: "image/webp" | "image/jpeg";
};

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  mimeType: "image/webp",
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/**
 * Compress/resize an image File. Returns a new File (or the original if it's
 * not a compressible raster image, e.g. SVG/GIF, or if anything goes wrong).
 */
export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  const o = { ...DEFAULTS, ...opts };

  // Skip non-raster / animated formats we shouldn't flatten.
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  try {
    const img = await loadImage(file);
    let { width, height } = img;

    // Scale down preserving aspect ratio.
    const scale = Math.min(1, o.maxWidth / width, o.maxHeight / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, o.mimeType, o.quality)
    );
    if (!blob) return file;

    // If compression somehow produced a bigger file, keep the original.
    if (blob.size >= file.size && scale === 1) return file;

    const ext = o.mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.${ext}`, { type: o.mimeType });
  } catch {
    return file; // never block an upload because compression failed
  }
}
