/**
 * Image Processor - Client-side WebP conversion
 * Uses Canvas API for high-performance image compression
 */

export const COMPRESSION_QUALITY = 0.82;

export async function processImage(file, quality = COMPRESSION_QUALITY) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
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
          const blob = await new Promise((resolveBlob, rejectBlob) => {
            canvas.toBlob((result) => {
              if (result) resolveBlob(result);
              else rejectBlob(new Error('This browser could not encode the image'));
            }, 'image/webp', quality);
          });

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
            preview: URL.createObjectURL(blob)
          });
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
    };
    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Could not decode this image'));
    };
    img.src = imageUrl;
  });
}

export async function batchProcess(files, onProgress, quality = COMPRESSION_QUALITY) {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await processImage(files[i], quality);
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
