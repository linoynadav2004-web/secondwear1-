import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';

export default function UploadZone({ label, description, onUploadSuccess, required = false }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    
    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setFileName(file.name);
    
    // Send it back to parent
    if (onUploadSuccess) {
      onUploadSuccess(objectUrl);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setPreviewUrl('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onUploadSuccess) onUploadSuccess('');
  };

  const triggerInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-dark mb-1.5 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-error-soft">*</span>}
        </label>
      )}
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInput}
        className={`w-full min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-custom text-center ${
          isDragActive 
            ? 'border-accent bg-accent/5' 
            : previewUrl 
              ? 'border-success-soft bg-success-soft/5' 
              : 'border-secondary/40 hover:border-accent hover:bg-accent/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          required={required && !previewUrl}
        />

        {previewUrl ? (
          <div className="relative w-full flex flex-col items-center gap-2 p-2">
            <div className="relative rounded-lg overflow-hidden border border-success-soft/20 shadow-md max-w-[200px] max-h-[140px]">
              <img 
                src={previewUrl} 
                alt="אסמכתא שהועלתה" 
                className="object-cover w-full h-full max-h-[130px] rounded-lg"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-custom cursor-pointer"
                title="הסר תמונה"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 text-success-soft text-sm font-semibold">
              <CheckCircle size={16} />
              <span className="truncate max-w-[240px] text-xs">{fileName || 'האסמכתא הועלתה בהצלחה!'}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-primary/5 rounded-full text-primary group-hover:scale-110 transition-custom">
              <Upload size={24} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">
                לחץ כאן או גרור קובץ לכאן
              </p>
              <p className="text-xs text-secondary mt-1">
                {description || 'ניתן להעלות קובצי תמונה (PNG, JPG, Screenshot)'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
