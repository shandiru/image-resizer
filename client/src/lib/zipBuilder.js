import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { formatFileSize } from './imageProcessor';

/**
 * Build ZIP file from processed images
 * Handles duplicate filenames by appending timestamps
 */
export async function buildZip(processedImages, onProgress) {
  const zip = new JSZip();
  const nameTracker = new Map();

  // Filter out failed images and add to zip
  const validImages = processedImages.filter(img => !img.error);

  for (let i = 0; i < validImages.length; i++) {
    const img = validImages[i];

    // Handle duplicate filenames
    let fileName = img.webpName;
    if (nameTracker.has(fileName)) {
      const count = nameTracker.get(fileName) + 1;
      nameTracker.set(fileName, count);
      const baseName = fileName.replace('.webp', '');
      fileName = `${baseName}_${count}.webp`;
    } else {
      nameTracker.set(fileName, 0);
    }

    zip.file(fileName, img.blob);

    if (onProgress) {
      onProgress(i + 1, validImages.length, fileName);
    }
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return {
    blob: zipBlob,
    fileCount: validImages.length,
    totalSize: zipBlob.size
  };
}

export async function downloadZip(processedImages) {
  const { blob, fileCount, totalSize } = await buildZip(processedImages);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `optimized-images-${timestamp}.zip`;

  saveAs(blob, fileName);

  return {
    fileName,
    fileCount,
    totalSize,
    formattedSize: formatFileSize(totalSize)
  };
}