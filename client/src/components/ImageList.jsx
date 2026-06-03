import React from 'react';
import { FileImage, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatFileSize } from '../lib/imageProcessor';

export default function ImageList({ files, onRemove, isProcessing }) {
  const totalOriginal = files.reduce((sum, f) => sum + (f.originalSize || 0), 0);
  const totalOptimized = files.reduce((sum, f) => sum + (f.optimizedSize || 0), 0);
  const totalSaved = totalOriginal - totalOptimized;
  const totalSavedPercent = totalOriginal > 0
    ? ((totalSaved / totalOriginal) * 100).toFixed(1)
    : 0;

  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-dark-100">{files.length}</p>
            <p className="text-sm text-dark-400">Images</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-500">{formatFileSize(totalOriginal)}</p>
            <p className="text-sm text-dark-400">Original</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{formatFileSize(totalOptimized)}</p>
            <p className="text-sm text-dark-400">Optimized</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">-{totalSavedPercent}%</p>
            <p className="text-sm text-dark-400">Saved</p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto scrollbar-thin">
        {files.map((item) => (
          <div
            key={item.id}
            className="card p-4 flex items-start gap-3 group hover:border-dark-600 transition-colors"
          >
            {/* Preview */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
              {item.preview ? (
                <img
                  src={item.preview}
                  alt={item.originalName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-dark-500" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-200 truncate" title={item.originalName}>
                {item.originalName}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-dark-400">
                <span>{formatFileSize(item.originalSize)}</span>
                <span>→</span>
                {item.status === 'done' ? (
                  <>
                    <span className="text-blue-400">{formatFileSize(item.optimizedSize)}</span>
                    <span className="text-green-400">(-{item.savedPercentage}%)</span>
                  </>
                ) : item.status === 'error' ? (
                  <span className="text-red-400">Failed</span>
                ) : item.status === 'processing' ? (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="text-dark-500">Pending</span>
                )}
              </div>

              {item.dimensions && (
                <p className="text-xs text-dark-500 mt-1">
                  {item.dimensions.width} × {item.dimensions.height}
                </p>
              )}
            </div>

            {/* Status Icon */}
            <div className="flex-shrink-0">
              {item.status === 'done' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {item.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            {/* Remove Button */}
            {!isProcessing && (
              <button
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-700 rounded transition-all"
              >
                <Trash2 className="w-4 h-4 text-dark-400 hover:text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}