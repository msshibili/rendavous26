import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Super-fast client-side canvas compressor.
 * Downscales images to 960px max dimension & compressed WebP/JPEG (~30-60KB).
 * Makes poster uploading instantaneous!
 */
export async function compressImageFile(file: File, maxDimension = 960, quality = 0.72): Promise<File | Blob> {
  // SVG or already tiny files (<80KB) don't need re-compression
  if (file.type === 'image/svg+xml' || file.size < 80 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" }));
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

/**
 * Fast poster image upload with 2-second timeout fallback to prevent any network hanging
 */
export async function uploadPosterImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; path: string }> {
  if (onProgress) onProgress(20);

  // Compress heavy files
  const fileToUpload = (await compressImageFile(file)) as File;

  if (onProgress) onProgress(60);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sanitizedName = (fileToUpload.name || file.name).toLowerCase().replace(/[^\w.-]/g, '_');
  const storagePath = `posters/${year}/${month}/${Date.now()}_${sanitizedName}`;

  const convertToDataUrl = (): Promise<{ url: string; path: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          url: reader.result as string,
          path: storagePath
        });
      };
      reader.onerror = () => {
        if (onProgress) onProgress(100);
        resolve({
          url: '',
          path: storagePath
        });
      };
      reader.readAsDataURL(fileToUpload);
    });
  };

  if (isFirebaseConfigured) {
    try {
      const storageRef = ref(storage, storagePath);
      
      // 20s Timeout promise to allow full upload to Firebase Storage
      const uploadPromise = uploadBytes(storageRef, fileToUpload);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timeout')), 20000)
      );

      const snapshot = (await Promise.race([uploadPromise, timeoutPromise])) as any;
      const downloadUrl = await getDownloadURL(snapshot.ref);
      if (onProgress) onProgress(100);
      return { url: downloadUrl, path: storagePath };
    } catch (err) {
      console.warn("Storage upload warning, using compressed Data URL fallback:", err);
      return await convertToDataUrl();
    }
  }

  return await convertToDataUrl();
}

export async function deletePosterImage(storagePath: string): Promise<void> {
  if (!storagePath) return;

  if (isFirebaseConfigured && !storagePath.startsWith('data:')) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn("Firebase storage delete error (continuing):", err);
    }
  }
}
