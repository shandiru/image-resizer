import React, { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { downloadZip } from '../lib/zipBuilder';

export default function DownloadButton({ files, onReset }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const processedFiles = files.filter(file => file.status === 'done');
  const hasErrors = files.some(file => file.status === 'error');

  const handleDownload = async () => {
    if (!processedFiles.length) return;
    setIsDownloading(true);
    try {
      const result = await downloadZip(processedFiles);
      setDownloadStatus({ success: true, fileName: result.fileName, fileCount: result.fileCount, size: result.formattedSize });
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus({ success: false, error: error.message });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!processedFiles.length) return null;
  return <div className="flex flex-col gap-3">
    <button onClick={handleDownload} disabled={isDownloading || downloadStatus?.success} className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${downloadStatus?.success ? 'bg-emerald-800 text-white' : hasErrors ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-800 hover:bg-emerald-900 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}>
      {isDownloading ? <><Loader2 className="w-5 h-5 animate-spin" /> Building ZIP…</> : downloadStatus?.success ? <><CheckCircle className="w-5 h-5" /> Download complete</> : <><Download className="w-5 h-5" /> Download {hasErrors ? 'successful images' : 'all images'} as ZIP</>}
    </button>
    {downloadStatus?.success && <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center">
      <p className="text-stone-800 mb-1 font-medium">{downloadStatus.fileName}</p>
      <p className="text-sm text-stone-500">{downloadStatus.fileCount} images · {downloadStatus.size}</p>
      <button onClick={onReset} className="mt-3 text-sm text-emerald-800 hover:text-emerald-950 underline">Convert another batch</button>
    </div>}
    {downloadStatus && !downloadStatus.success && <p role="alert" className="text-sm text-rose-700 text-center">Could not create the ZIP. Please try again.</p>}
    {hasErrors && <p className="text-sm text-amber-800 text-center">{files.filter(file => file.status === 'error').length} image(s) failed and are excluded.</p>}
  </div>;
}
