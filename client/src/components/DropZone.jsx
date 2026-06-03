import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X } from 'lucide-react';

export default function DropZone({ files, setFiles, onProcessing }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending', // pending, processing, done, error
        originalName: file.name,
        originalSize: file.size,
        optimizedSize: null,
        savedPercentage: null,
        preview: null,
        dimensions: null
      }));

      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.svg', '.webp', '.bmp', '.tiff']
    },
    multiple: true,
    noClick: files.length > 0
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`drop-zone p-12 text-center cursor-pointer ${
            isDragActive ? 'active' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${
              isDragActive ? 'bg-accent-500/20' : 'bg-dark-700'
            }`}>
              <Upload className={`w-10 h-10 ${
                isDragActive ? 'text-accent-500' : 'text-dark-400'
              }`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark-100 mb-2">
                {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
              </h3>
              <p className="text-dark-400 mb-4">
                or click to browse files (JPEG, PNG, SVG, etc.)
              </p>
              <p className="text-sm text-dark-500">
                Unlimited file count • Client-side processing • WebP conversion
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark-300">
            <Image className="w-5 h-5" />
            <span className="font-medium">{files.length} image{files.length !== 1 ? 's' : ''} selected</span>
          </div>
          <button
            onClick={() => setFiles([])}
            className="flex items-center gap-2 px-4 py-2 text-sm text-dark-400 hover:text-dark-200 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}