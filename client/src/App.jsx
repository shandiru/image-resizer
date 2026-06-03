import React, { useState, useCallback } from 'react';
import { Wand2, Zap, Layers } from 'lucide-react';
import DropZone from './components/DropZone';
import ImageList from './components/ImageList';
import ProgressBar from './components/ProgressBar';
import DownloadButton from './components/DownloadButton';
import { batchProcess } from './lib/imageProcessor';

function App() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: null });

  const handleProcessImages = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: pendingFiles.length, fileName: null });

    try {
      const processed = await batchProcess(
        pendingFiles.map(f => f.file),
        (current, total) => {
          setProgress({ current, total });
        }
      );

      // Merge processed results with existing files
      setFiles(prev => prev.map(file => {
        if (file.status !== 'pending') return file;
        const result = processed.find(r => r.originalName === file.originalName);
        if (result) {
          return { ...file, ...result, status: result.error ? 'error' : 'done' };
        }
        return file;
      }));
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0, fileName: null });
    }
  };

  const handleReset = useCallback(() => {
    setFiles([]);
    setProgress({ current: 0, total: 0, fileName: null });
  }, []);

  const hasPendingFiles = files.some(f => f.status === 'pending');
  const hasProcessedFiles = files.some(f => f.status === 'done');

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-600 rounded-xl">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark-100">ImageOptimizer</h1>
                <p className="text-sm text-dark-400">Client-side WebP Converter</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-dark-400">
                <Zap className="w-4 h-4 text-accent-500" />
                <span>100% Client-side</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-dark-400">
                <Wand2 className="w-4 h-4 text-accent-500" />
                <span>Best Quality</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Drop Zone */}
          <DropZone files={files} setFiles={setFiles} onProcessing={isProcessing} />

          {/* Process Button */}
          {hasPendingFiles && (
            <button
              onClick={handleProcessImages}
              disabled={isProcessing}
              className="w-full py-3 px-6 bg-accent-600 hover:bg-accent-500 disabled:bg-dark-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-accent-500/20"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 animate-pulse" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Convert {hasPendingFiles ? files.filter(f => f.status === 'pending').length : ''} Images to WebP
                </span>
              )}
            </button>
          )}

          {/* Progress Bar */}
          <ProgressBar
            current={progress.current}
            total={progress.total}
            isActive={isProcessing}
          />

          {/* Image List */}
          <ImageList
            files={files}
            onRemove={(id) => setFiles(prev => prev.filter(f => f.id !== id))}
            isProcessing={isProcessing}
          />

          {/* Download Button */}
          {hasProcessedFiles && (
            <DownloadButton files={files} onReset={handleReset} />
          )}

          {/* Empty State Info */}
          {files.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="card p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-accent-500/20 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-accent-500" />
                </div>
                <h3 className="font-semibold text-dark-200 mb-1">WebP Format</h3>
                <p className="text-sm text-dark-400">Modern image format with superior compression</p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-dark-200 mb-1">Lightning Fast</h3>
                <p className="text-sm text-dark-400">All processing happens in your browser</p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-dark-200 mb-1">Batch Download</h3>
                <p className="text-sm text-dark-400">Get all images in a single ZIP file</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-dark-500">
          Built with React + Tailwind CSS • All processing happens locally in your browser
        </div>
      </footer>
    </div>
  );
}

export default App;