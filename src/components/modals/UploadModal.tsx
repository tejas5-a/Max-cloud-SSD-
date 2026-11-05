import React, { useState, useRef } from 'react';
import { Upload, FolderUp, X, Check, FileText } from 'lucide-react';
import type { CloudProviderId } from '../../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], provider: CloudProviderId) => void;
  defaultProvider: CloudProviderId;
  isGoogleDriveConnected: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  defaultProvider,
  isGoogleDriveConnected,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [provider, setProvider] = useState<CloudProviderId>(defaultProvider);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const array = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...array]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleStartUpload = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles, provider);
    setSelectedFiles([]);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
            <Upload className="w-4 h-4 text-orange-400" />
            <span>Upload to MAX CLOUD SSD</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Destination Provider Selector */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Target Storage Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('googledrive')}
                disabled={!isGoogleDriveConnected}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                  provider === 'googledrive'
                    ? 'border-orange-500 bg-orange-950/20 text-white'
                    : 'border-[#1E293B] bg-[#141E34] text-slate-400 hover:border-slate-700'
                } ${!isGoogleDriveConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">Google Drive</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isGoogleDriveConnected ? 'Cloud synced (API v3)' : 'Requires connection'}
                  </div>
                </div>
                {provider === 'googledrive' && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setProvider('localssd')}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                  provider === 'localssd'
                    ? 'border-orange-500 bg-orange-950/20 text-white'
                    : 'border-[#1E293B] bg-[#141E34] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">Local SSD Cache</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High-speed NVMe store</div>
                </div>
                {provider === 'localssd' && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-950/30'
                : 'border-[#1E293B] hover:border-slate-600 bg-[#0A0F1D]'
            }`}
          >
            <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-200">
              Drag & drop files here, or browse from computer
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Supports Documents, Images, Videos, Archives, EXEs, and Folders
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] text-xs font-medium text-slate-200 transition-colors"
              >
                Select Files
              </button>

              <input
                ref={folderInputRef}
                type="file"
                /* @ts-expect-error webkitdirectory is standard for folder picking */
                webkitdirectory=""
                directory=""
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <FolderUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Folder</span>
              </button>
            </div>
          </div>

          {/* Selected Files Preview List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Selected {selectedFiles.length} item(s)</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-red-400 hover:underline text-[10px]"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto rounded-lg bg-[#080D17] border border-[#1E293B] p-2 space-y-1">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-[#10192E]">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate text-slate-200">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">{formatSize(f.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-700">
            Cancel
          </button>
          <button
            onClick={handleStartUpload}
            disabled={selectedFiles.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white disabled:opacity-50 shadow-md shadow-orange-950/40"
          >
            <Upload className="w-4 h-4" />
            <span>Start Upload ({selectedFiles.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
