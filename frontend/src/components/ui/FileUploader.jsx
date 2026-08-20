import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function FileUploader({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-surface cursor-pointer hover:bg-surface-muted transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      <UploadCloud className="text-text-muted mb-2" size={32} />
      <span className="text-sm text-text-muted">Click or drag file to upload</span>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
}
