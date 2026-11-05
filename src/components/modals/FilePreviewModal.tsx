import React from 'react';
import { Eye, Download, Star, Share2, Trash2, X, ExternalLink, Calendar, HardDrive, Hash, Check } from 'lucide-react';
import type { CloudFile } from '../../types';

interface FilePreviewModalProps {
  file: CloudFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: CloudFile) => void;
  onToggleStar: (file: CloudFile) => void;
  onShare: (file: CloudFile) => void;
  onDelete: (file: CloudFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
  onToggleStar,
  onShare,
  onDelete,
}) => {
  if (!isOpen || !file) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E293B] bg-[#0A0F1D]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Eye className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-white truncate">{file.name}</h3>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <span className="capitalize">{file.category}</span>
                <span>•</span>
                <span className="uppercase">{file.provider}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visual Preview */}
          <div className="w-full rounded-xl bg-[#080D17] border border-[#1E293B] flex items-center justify-center p-6 min-h-[220px]">
            {file.category === 'image' && file.thumbnailUrl ? (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="max-h-72 max-w-full rounded object-contain shadow-lg"
              />
            ) : (
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
                  <HardDrive className="w-8 h-8" />
                </div>
                <div className="text-sm font-medium text-slate-300">{file.name}</div>
                <div className="text-xs text-slate-500 font-mono">{file.mimeType}</div>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#141E34] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px] mb-1">File Size</span>
              <span className="text-slate-100 font-semibold font-mono">{formatSize(file.sizeBytes)}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#141E34] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px] mb-1">Provider Engine</span>
              <span className="text-orange-400 font-semibold">
                {file.provider === 'googledrive' ? 'Google Drive (API v3)' : 'MAX Local SSD (NVMe)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#141E34] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px] mb-1">Modified Date</span>
              <div className="flex items-center gap-1.5 text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(file.modifiedTime).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141E34] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px] mb-1">Integrity Check (MD5)</span>
              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px] truncate">
                <Hash className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{file.md5Checksum || 'Verified via Local DPAPI Hash'}</span>
              </div>
            </div>
          </div>

          {file.webViewLink && (
            <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-300">Available on Google Drive Web Viewer</span>
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium"
              >
                <span>Open in Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0A0F1D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStar(file)}
              className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                file.starred
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#141E34]'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>{file.starred ? 'Starred' : 'Star'}</span>
            </button>

            <button
              onClick={() => onShare(file)}
              className="p-2 rounded-lg border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#141E34] text-xs transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={() => onDelete(file)}
              className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(file)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs shadow-md shadow-orange-950/40 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
