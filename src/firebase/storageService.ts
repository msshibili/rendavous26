import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export interface UploadProgressCallback {
  (progress: number): void;
}

export async function uploadPosterImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; path: string }> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sanitizedName = file.name.toLowerCase().replace(/[^\w.-]/g, '_');
  const storagePath = `posters/${year}/${month}/${Date.now()}_${sanitizedName}`;

  if (isFirebaseConfigured) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress);
          },
          (error) => {
            console.error("Firebase storage upload error:", error);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url: downloadUrl, path: storagePath });
          }
        );
      });
    } catch (err) {
      console.warn("Firebase Storage unavailable, converting to Data URL:", err);
    }
  }

  // Fallback to Data URL for instant out-of-the-box local upload support
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    };
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve({
        url: reader.result as string,
        path: storagePath
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
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
