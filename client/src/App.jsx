import React, { useState, useCallback } from 'react';
import { Aperture, ShieldCheck, SlidersHorizontal, Sparkles, ArrowRight, Image as ImageIcon } from 'lucide-react';
import DropZone from './components/DropZone';
import ImageList from './components/ImageList';
import ProgressBar from './components/ProgressBar';
import DownloadButton from './components/DownloadButton';
import { batchProcess, COMPRESSION_QUALITY } from './lib/imageProcessor';

function App() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(COMPRESSION_QUALITY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: null });

  const handleProcessImages = async () => {
    const pendingFiles = files.filter(file => file.status === 'pending');
    if (!pendingFiles.length || isProcessing) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: pendingFiles.length, fileName: null });
    try {
      const processed = await batchProcess(pendingFiles.map(file => file.file), (current, total) => setProgress({ current, total }), quality);
      let resultIndex = 0;
      setFiles(prev => prev.map(file => {
        if (file.status !== 'pending') return file;
        const result = processed[resultIndex++];
        return result ? { ...file, ...result, status: result.error ? 'error' : 'done' } : file;
      }));
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0, fileName: null });
    }
  };

  const handleReset = useCallback(() => {
    files.forEach(file => { if (file.preview) URL.revokeObjectURL(file.preview); });
    setFiles([]);
    setProgress({ current: 0, total: 0, fileName: null });
  }, [files]);

  const handleRemove = useCallback((id) => {
    const removed = files.find(file => file.id === id);
    if (removed?.preview) URL.revokeObjectURL(removed.preview);
    setFiles(prev => prev.filter(file => file.id !== id));
  }, [files]);

  const pendingCount = files.filter(file => file.status === 'pending').length;
  const hasProcessedFiles = files.some(file => file.status === 'done');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="Pixel Press home">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center"><Aperture className="w-5 h-5 text-white" /></div>
            <div><h1 className="font-bold tracking-tight">Pixel Press</h1><p className="text-xs text-stone-500">Image optimizer</p></div>
          </a>
          <div className="hidden sm:flex items-center gap-2 text-sm text-stone-600"><ShieldCheck className="w-4 h-4 text-emerald-700" /> Images stay on your device</div>
        </div>
      </header>

      <main id="top" className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="max-w-3xl mb-9">
          <p className="text-sm font-semibold tracking-wide uppercase text-emerald-800 mb-3">Fast, private image conversion</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08]">Smaller images.<br className="hidden sm:block" /> Same sharp details.</h2>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl">Convert a batch of photos to WebP in your browser. Choose the quality that works for your project.</p>
        </div>

        <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6" aria-label="Image conversion">
          <DropZone files={files} setFiles={setFiles} onProcessing={isProcessing} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-stone-100 pt-5">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700"><SlidersHorizontal className="w-4 h-4 text-emerald-800" /> Output quality</div>
            <input aria-label="Output quality" type="range" min="0.5" max="1" step="0.01" value={quality} onChange={event => setQuality(Number(event.target.value))} className="quality-slider flex-1" />
            <span className="text-sm font-semibold tabular-nums text-stone-800 w-12">{Math.round(quality * 100)}%</span>
            <span className="text-xs text-stone-500">Higher quality = larger files</span>
          </div>
          {pendingCount > 0 && <button onClick={handleProcessImages} disabled={isProcessing} className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-white font-semibold rounded-xl transition-colors">
            {isProcessing ? <><Sparkles className="w-5 h-5 animate-pulse" /> Converting images…</> : <>Convert {pendingCount} image{pendingCount !== 1 ? 's' : ''} to WebP <ArrowRight className="w-5 h-5" /></>}
          </button>}
          <ProgressBar current={progress.current} total={progress.total} isActive={isProcessing} />
          <ImageList files={files} onRemove={handleRemove} isProcessing={isProcessing} />
          {hasProcessedFiles && <DownloadButton files={files} onReset={handleReset} />}
        </section>

        {files.length === 0 && <div className="grid sm:grid-cols-3 gap-5 mt-8">
          <article className="p-5"><ShieldCheck className="w-5 h-5 text-emerald-800 mb-3" /><h3 className="font-semibold mb-1">Private by design</h3><p className="text-sm text-stone-600">Your photos are converted locally and never uploaded.</p></article>
          <article className="p-5"><SlidersHorizontal className="w-5 h-5 text-emerald-800 mb-3" /><h3 className="font-semibold mb-1">Your quality settings</h3><p className="text-sm text-stone-600">Tune compression to balance crisp details and smaller files.</p></article>
          <article className="p-5"><ImageIcon className="w-5 h-5 text-emerald-800 mb-3" /><h3 className="font-semibold mb-1">Ready in one batch</h3><p className="text-sm text-stone-600">Convert up to 40 images, then download them together.</p></article>
        </div>}
      </main>
      <footer className="max-w-6xl mx-auto px-5 sm:px-8 py-6 text-sm text-stone-500">Made for the web. Your files stay on this device.</footer>
    </div>
  );
}

export default App;
