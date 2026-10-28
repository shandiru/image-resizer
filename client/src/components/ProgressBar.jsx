import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProgressBar({ current, total, fileName, isActive }) {
  if (!isActive) return null;

  const percentage = Math.round((current / total) * 100);

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-emerald-800 animate-spin" />
          <span className="text-stone-700 font-medium">
            Processing {current} of {total} images...
          </span>
        </div>
        <span className="text-emerald-800 font-bold">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-700 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {fileName && (
        <p className="text-sm text-stone-500 mt-2 truncate">
          Current: <span className="text-stone-800">{fileName}</span>
        </p>
      )}
    </div>
  );
}
