import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProgressBar({ current, total, fileName, isActive }) {
  if (!isActive) return null;

  const percentage = Math.round((current / total) * 100);

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-accent-500 animate-spin" />
          <span className="text-dark-200 font-medium">
            Processing {current} of {total} images...
          </span>
        </div>
        <span className="text-accent-500 font-bold">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-600 to-accent-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {fileName && (
        <p className="text-sm text-dark-400 mt-2 truncate">
          Current: <span className="text-dark-200">{fileName}</span>
        </p>
      )}
    </div>
  );
}