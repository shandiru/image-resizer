import React, { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { downloadZip } from '../lib/zipBuilder';
import { formatFileSize } from '../lib/imageProcessor';

export default function DownloadButton({ files, onReset }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipTotal, setZipTotal] = useState(0);

  const processedFiles = files.filter(f => f.status === 'done');
  const hasErrors = files.some(f => f.status === 'error');

  const handleDownload = async () => {
    if (processedFiles.length === 0) return;

    setIsDownloading(true);
    setDownloadStatus('building');

    try {
      const result = await downloadZip(processedFiles, (current, total, fileName) => {
        setZipProgress(current);
        setZipTotal(total);
      });

      setDownloadStatus({
        success: true,
        fileName: result.fileName,
        fileCount: result.fileCount,
        size: result.formattedSize
      });

      // Send analytics to backend
      await fetch('/api/analytics/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageCount: result.fileCount,
          originalSize: files.reduce((sum, f) => sum + (f.originalSize || 0), 0),
          optimizedSize: result.totalSize,
          savedBytes: files.reduce((sum, f) => sum + ((f.originalSize || 0) - (f.optimizedSize || 0)), 0)
        })
      }).catch(console.error);

    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus({ success: false, error: error.message });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNewBatch = () => {
    onReset();
    setDownloadStatus(null);
    setZipProgress(0);
    setZipTotal(0);
  };

  if (processedFiles.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Main Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading || downloadStatus?.success}
        className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
          downloadStatus?.success
            ? 'bg-green-600 text-white'
            : hasErrors
              ? 'bg-yellow-600 hover:bg-yellow-500'
              : 'bg-accent-600 hover:bg-accent-500 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-500/20`}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Building ZIP... {zipTotal > 0 && `(${zipProgress}/${zipTotal})`}
          </>
        ) : downloadStatus?.success ? (
          <>
            <CheckCircle className="w-6 h-6" />
            Download Complete!
          </>
        ) : hasErrors ? (
          <>
            <Download className="w-6 h-6" />
            Download {processedFiles.length} Successful Images
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            Download All as ZIP
          </>
        )}
      </button>

      {/* Download Summary */}
      {downloadStatus?.success && (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-dark-200 mb-1">
            📦 <strong>{downloadStatus.fileName}</strong>
          </p>
          <p className="text-sm text-dark-400">
            {downloadStatus.fileCount} images • {downloadStatus.size}
          </p>
          <button
            onClick={handleNewBatch}
            className="mt-3 text-sm text-accent-500 hover:text-accent-400 underline"
          >
            Process more images
          </button>
        </div>
      )}

      {/* Error warning */}
      {hasErrors && (
        <p className="text-sm text-yellow-400 text-center">
          ⚠️ {files.filter(f => f.status === 'error').length} image(s) failed to process and are excluded
        </p>
      )}
    </div>
  );
}