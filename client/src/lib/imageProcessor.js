/**
 * Image Processor - Client-side WebP conversion
 * Uses Canvas API for high-performance image compression
 */

export const COMPRESSION_QUALITY = 0.8; // 80% quality - best balance

export async function processImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas with image dimensions
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Handle large images - scale down if needed
          const maxDimension = 4096;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP with specified quality
          const webpDataUrl = canvas.toDataURL('image/webp', COMPRESSION_QUALITY);

          // Convert base64 to blob
          const blob = dataURLToBlob(webpDataUrl);

          // Calculate savings
          const originalSize = file.size;
          const optimizedSize = blob.size;
          const savedPercentage = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

          resolve({
            originalName: file.name,
            originalSize,
            optimizedSize,
            savedPercentage: parseFloat(savedPercentage),
            blob,
            webpName: file.name.replace(/\.[^/.]+$/, '') + '.webp',
            dimensions: { width, height },
            preview: webpDataUrl
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function dataURLToBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

export async function batchProcess(files, onProgress) {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await processImage(files[i]);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${files[i].name}:`, error);
      results.push({
        originalName: files[i].name,
        originalSize: files[i].size,
        error: true,
        errorMessage: error.message
      });
    }

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeIcon(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return '📷';
    case 'png':
      return '🖼️';
    case 'gif':
      return '🎞️';
    case 'svg':
      return '🔷';
    case 'webp':
      return '🟢';
    default:
      return '📄';
  }
}