import React from 'react';
import { FileImage, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatFileSize } from '../lib/imageProcessor';

export default function ImageList({ files, onRemove, isProcessing }) {
  const totalOriginal = files.reduce((sum, file) => sum + (file.originalSize || 0), 0);
  const completed = files.filter(file => file.status === 'done');
  const totalOptimized = completed.reduce((sum, file) => sum + (file.optimizedSize || 0), 0);
  const savedPercent = totalOriginal ? Math.max(0, (1 - totalOptimized / totalOriginal) * 100) : 0;
  if (!files.length) return null;

  return <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-50 border border-stone-200 rounded-xl p-4 text-center">
      <div><p className="text-xl font-semibold">{files.length}</p><p className="text-xs text-stone-500 mt-1">Images</p></div>
      <div><p className="text-xl font-semibold">{formatFileSize(totalOriginal)}</p><p className="text-xs text-stone-500 mt-1">Original</p></div>
      <div><p className="text-xl font-semibold">{formatFileSize(totalOptimized)}</p><p className="text-xs text-stone-500 mt-1">Converted</p></div>
      <div><p className="text-xl font-semibold text-emerald-800">{completed.length ? `${savedPercent.toFixed(1)}%` : '—'}</p><p className="text-xs text-stone-500 mt-1">Smaller</p></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto scrollbar-thin">
      {files.map(item => <div key={item.id} className="border border-stone-200 rounded-xl p-3 flex items-center gap-3 group bg-white">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
          {item.preview ? <img src={item.preview} alt={item.originalName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FileImage className="w-6 h-6 text-stone-400" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate" title={item.originalName}>{item.originalName}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
            <span>{formatFileSize(item.originalSize)}</span><span>→</span>
            {item.status === 'done' ? <span className="text-emerald-800">{formatFileSize(item.optimizedSize)} · {item.savedPercentage >= 0 ? `${item.savedPercentage}% smaller` : `${Math.abs(item.savedPercentage)}% larger`}</span> : item.status === 'error' ? <span className="text-rose-700">Conversion failed</span> : item.status === 'processing' ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Converting</span> : <span>Ready</span>}
          </div>
          {item.dimensions && <p className="text-xs text-stone-400 mt-1">{item.dimensions.width} × {item.dimensions.height}</p>}
        </div>
        {item.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
        {item.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
        {!isProcessing && <button onClick={() => onRemove(item.id)} aria-label={`Remove ${item.originalName}`} className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md"><Trash2 className="w-4 h-4" /></button>}
      </div>)}
    </div>
  </div>;
}
