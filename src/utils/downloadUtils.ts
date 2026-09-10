/**
 * Utility for exporting and downloading poster graphics in multiple image formats (.jpg, .png, .svg).
 */

export type ExportFormat = 'jpg' | 'png' | 'svg';

/**
 * Downloads an image from a URL or Data URI in the requested format (.jpg, .png, or .svg).
 */
export async function downloadPosterImage(
  imageUrl: string,
  baseFilename: string,
  format: ExportFormat = 'jpg'
): Promise<void> {
  const filename = sanitizeFilename(baseFilename);

  // If format is SVG and the image is already SVG data or URL, download directly
  if (format === 'svg' && (imageUrl.startsWith('data:image/svg') || imageUrl.endsWith('.svg'))) {
    triggerDownload(imageUrl, `${filename}.svg`);
    return;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Use natural dimensions or default high-res dimensions (e.g. 1600x2262 for 2x scale quality)
        const width = (img.naturalWidth && img.naturalWidth > 0) ? img.naturalWidth : 1600;
        const height = (img.naturalHeight && img.naturalHeight > 0) ? img.naturalHeight : 2262;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          triggerDownload(imageUrl, `${filename}.${format}`);
          resolve();
          return;
        }

        // Fill opaque white background for JPG format to prevent black transparent areas
        if (format === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }

        // Draw current image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const extension = format === 'jpg' ? 'jpg' : 'png';

        if (canvas.toBlob) {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                triggerDownload(blobUrl, `${filename}.${extension}`);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
              } else {
                const dataUrl = canvas.toDataURL(mimeType, 0.95);
                triggerDownload(dataUrl, `${filename}.${extension}`);
              }
              resolve();
            },
            mimeType,
            0.95
          );
        } else {
          const dataUrl = canvas.toDataURL(mimeType, 0.95);
          triggerDownload(dataUrl, `${filename}.${extension}`);
          resolve();
        }
      } catch (err) {
        console.warn('Canvas conversion failed, downloading fallback URL:', err);
        triggerDownload(imageUrl, `${filename}.${format}`);
        resolve();
      }
    };

    img.onerror = (err) => {
      console.warn('Image load error during download export:', err);
      // Direct download fallback
      triggerDownload(imageUrl, `${filename}.${format}`);
      resolve();
    };

    // Prepare image src based on input type
    if (imageUrl.startsWith('data:image/svg+xml')) {
      let svgContent: string | null = null;

      if (imageUrl.includes(';utf8,')) {
        svgContent = decodeURIComponent(imageUrl.split(';utf8,')[1]);
      } else if (imageUrl.includes(';base64,')) {
        svgContent = atob(imageUrl.split(';base64,')[1]);
      } else {
        svgContent = decodeURIComponent(imageUrl.replace(/^data:image\/svg\+xml,/, ''));
      }

      if (svgContent) {
        // Wrap SVG content into Blob URL for robust canvas rendering across browsers
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        img.src = blobUrl;
        return;
      }
    }

    img.src = imageUrl;
  });
}

/**
 * Triggers browser anchor download
 */
function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Normalizes title string into clean filename
 */
function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'rendezvous-poster';
}
