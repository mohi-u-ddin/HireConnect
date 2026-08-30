import { useRef, useState, type DragEvent } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '../../utils/format';

interface FileUploadProps {
  label?: string;
  accept?: string;
  currentFileName?: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  hint?: string;
  error?: string;
}

export function FileUpload({ label, accept, currentFileName, onFileSelect, onRemove, hint, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  if (currentFileName) {
    return (
      <div className="w-full">
        {label && <p className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</p>}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText size={18} className="text-primary flex-shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{currentFileName}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Replace
            </button>
            {onRemove && (
              <button type="button" onClick={onRemove} aria-label="Remove file" className="text-slate-400 hover:text-danger">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && <p className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</p>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary-light' : 'border-slate-300 dark:border-slate-700 hover:border-primary/50',
          error && 'border-danger'
        )}
      >
        <Upload size={22} className="text-slate-400" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="text-primary font-medium">Click to upload</span> or drag and drop
        </p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
