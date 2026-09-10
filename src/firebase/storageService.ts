import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Ultra-fast client-side canvas compressor.
 * Downscales heavy files (camera photos, 10-15MB graphics) to 1280px max dimension & compressed WebP/JPEG (~100-200KB).
 * Eliminates upload lag and prevents Firestore document 1MB quota crashes!
 */
export async function compressImageFile(file: File, maxDimension = 1280, quality = 0.78): Promise<File | Blob> {
  // SVG doesn't need canvas compression
  if (file.type === 'image/svg+xml') {
    return file;
  }

  // Already lightweight (<150KB)
  if (file.size < 150 * 1024) {
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

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
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

export async function uploadPosterImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; path: string }> {
  // Compress if larger than 400KB
  const fileToUpload = (await compressImageFile(file)) as File;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sanitizedName = (fileToUpload.name || file.name).toLowerCase().replace(/[^\w.-]/g, '_');
  const storagePath = `posters/${year}/${month}/${Date.now()}_${sanitizedName}`;

  if (onProgress) onProgress(40);

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
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      if (onProgress) onProgress(100);
      return { url: downloadUrl, path: storagePath };
    } catch (err) {
      console.warn("Firebase Storage upload warning, using Data URL fallback:", err);
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
