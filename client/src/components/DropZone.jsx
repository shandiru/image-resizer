import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X, Plus } from 'lucide-react';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 40;

export default function DropZone({ files, setFiles, onProcessing }) {
  const clearFiles = () => {
    files.forEach(file => { if (file.preview) URL.revokeObjectURL(file.preview); });
    setFiles([]);
  };
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const slots = Math.max(0, MAX_FILES - files.length);
    const newFiles = acceptedFiles.slice(0, slots).map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'pending',
      originalName: file.name,
      originalSize: file.size,
      optimizedSize: null,
      savedPercentage: null,
      preview: null,
      dimensions: null
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, setFiles]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    multiple: true,
    noClick: files.length > 0,
    disabled: onProcessing
  });

  return (
    <div className="space-y-3">
      {files.length === 0 ? (
        <div {...getRootProps()} className={`drop-zone p-12 text-center cursor-pointer ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-2xl ${isDragActive ? 'bg-accent-100' : 'bg-stone-100'}`}>
              <Upload className={`w-9 h-9 ${isDragActive ? 'text-accent-700' : 'text-stone-500'}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{isDragActive ? 'Drop your images here' : 'Drop images to get started'}</h3>
              <p className="text-stone-600 mb-3">or click to browse JPEG, PNG, and WebP</p>
              <p className="text-sm text-stone-500">Up to 40 images · 25 MB each · Processed privately in your browser</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-700">
            <Image className="w-5 h-5" />
            <span className="font-medium">{files.length} image{files.length !== 1 ? 's' : ''} selected</span>
            <input {...getInputProps()} />
          </div>
          <div className="flex items-center gap-2">
            <button {...getRootProps()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-800 hover:bg-accent-50 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add images
            </button>
            <button onClick={clearFiles} disabled={onProcessing} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50">
              <X className="w-4 h-4" /> Clear all
            </button>
          </div>
        </div>
      )}
      {fileRejections.length > 0 && <p role="alert" className="text-sm text-rose-700">Some files were skipped. Choose JPEG, PNG, or WebP images under 25 MB, with at most 40 images per batch.</p>}
      {files.length >= MAX_FILES && <p className="text-sm text-stone-500">Batch limit reached. Clear the list to start another batch.</p>}
    </div>
  );
}
