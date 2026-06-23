import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ModerationResult {
  allowed: boolean;
  reason: string;
  categories: string[];
  severity: "low" | "medium" | "high";
  degraded?: boolean;
}

const OK: ModerationResult = { allowed: true, reason: "", categories: [], severity: "low" };

/** Local quick blocklist — catches obvious garbage instantly without a network round-trip. */
const LOCAL_BLOCK_PATTERNS: RegExp[] = [
  /\b(porn|xxx|nude|sex\s*chat|onlyfans|escort)\b/i,
  /\b(kill\s+(yourself|urself)|kys)\b/i,
  /\b(n[i1]gg(er|a)|f[a@]ggot|retard)\b/i,
  /\b(buy\s+followers|free\s+bitcoin|crypto\s+giveaway|click\s+here\s+to\s+win)\b/i,
];

function localTextCheck(content: string): ModerationResult | null {
  for (const re of LOCAL_BLOCK_PATTERNS) {
    if (re.test(content)) {
      return {
        allowed: false,
        reason: "Your post contains language that violates UnityNets community rules.",
        categories: ["local-block"],
        severity: "high",
      };
    }
  }
  return null;
}

export async function moderateText(content: string): Promise<ModerationResult> {
  if (!content || !content.trim()) return OK;
  const local = localTextCheck(content);
  if (local) return local;

  try {
    const { data, error } = await supabase.functions.invoke("moderate-content", {
      body: { type: "text", content },
    });
    if (error) {
      console.warn("moderateText error:", error);
      return OK; // fail-open
    }
    return data as ModerationResult;
  } catch (e) {
    console.warn("moderateText threw:", e);
    return OK;
  }
}

/** Convert a File/Blob to base64 (without the data: prefix). Resizes large images to keep payload small. */
async function fileToModerationBase64(file: File | Blob, maxSide = 1024): Promise<{ base64: string; mimeType: string }> {
  const mimeType = (file as File).type || "image/jpeg";
  // For non-images, return raw
  if (!mimeType.startsWith("image/")) {
    const buf = await file.arrayBuffer();
    return { base64: arrayBufferToBase64(buf), mimeType };
  }

  // Resize image via canvas to cap upload payload (~ a few hundred KB).
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    let { width, height } = img;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d ctx");
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = dataUrl.split(",")[1] ?? "";
    return { base64, mimeType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
  }
  return btoa(binary);
}

export async function moderateImageFile(file: File | Blob): Promise<ModerationResult> {
  try {
    const { base64, mimeType } = await fileToModerationBase64(file);
    const { data, error } = await supabase.functions.invoke("moderate-content", {
      body: { type: "image", imageBase64: base64, mimeType },
    });
    if (error) {
      console.warn("moderateImageFile error:", error);
      return OK; // fail-open
    }
    return data as ModerationResult;
  } catch (e) {
    console.warn("moderateImageFile threw:", e);
    return OK;
  }
}

/** Extract first video frame and moderate it as an image. */
export async function moderateVideoFile(file: File): Promise<ModerationResult> {
  try {
    const frameBlob = await extractFirstVideoFrame(file);
    if (!frameBlob) return OK;
    return await moderateImageFile(frameBlob);
  } catch (e) {
    console.warn("moderateVideoFile threw:", e);
    return OK;
  }
}

function extractFirstVideoFrame(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(1, (video.duration || 1) / 2);
      } catch {
        // fall through to onseeked with current frame
      }
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          resolve(null);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve(blob);
          },
          "image/jpeg",
          0.8,
        );
      } catch {
        cleanup();
        resolve(null);
      }
    };
    video.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

/**
 * Convenience wrapper: shows a toast and returns false if content is blocked.
 * Caller should abort their upload when this returns false.
 */
export async function guardOrToast(
  kind: "text" | "image" | "video",
  payload: string | File | Blob,
): Promise<boolean> {
  let result: ModerationResult;
  if (kind === "text") result = await moderateText(payload as string);
  else if (kind === "image") result = await moderateImageFile(payload as File | Blob);
  else result = await moderateVideoFile(payload as File);

  if (!result.allowed) {
    toast({
      title: "Content blocked",
      description:
        result.reason ||
        "This content violates UnityNets community rules and cannot be uploaded.",
      variant: "destructive",
    });
    return false;
  }
  return true;
}
