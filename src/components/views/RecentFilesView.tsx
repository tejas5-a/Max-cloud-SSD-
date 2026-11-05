import React from 'react';
import { Clock, Download, Eye, Star, Share2, FileText, HardDrive, Cloud } from 'lucide-react';
import type { CloudFile } from '../../types';

interface RecentFilesViewProps {
  files: CloudFile[];
  onOpenFilePreview: (file: CloudFile) => void;
  onDownloadFile: (file: CloudFile) => void;
  onToggleStar: (file: CloudFile) => void;
  onShareFile: (file: CloudFile) => void;
}

export const RecentFilesView: React.FC<RecentFilesViewProps> = ({
  files,
  onOpenFilePreview,
  onDownloadFile,
  onToggleStar,
  onShareFile,
}) => {
  const recentFiles = [...files]
    .filter((f) => !f.trashed)
    .sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime())
    .slice(0, 25);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Recent Files</h1>
            <p className="text-xs text-slate-400">Files modified or accessed recently across your connected providers</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">{recentFiles.length} items</span>
      </div>

      <div className="border border-[#1E293B] rounded-2xl bg-[#0F172A] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0A0F1D] text-slate-400 font-semibold border-b border-[#1E293B]">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3">Provider</th>
              <th className="py-3 px-3">Last Modified</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/60">
            {recentFiles.map((file) => (
              <tr
                key={file.id}
                onClick={() => onOpenFilePreview(file)}
                className="hover:bg-[#141E34] cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate max-w-md">{file.name}</span>
                    {file.starred && <Star className="w-3 h-3 text-amber-400 fill-current shrink-0" />}
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-slate-400">{formatSize(file.sizeBytes)}</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {file.provider === 'googledrive' ? <Cloud className="w-3 h-3 text-blue-400" /> : <HardDrive className="w-3 h-3 text-orange-400" />}
                    <span className="capitalize">{file.provider}</span>
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">{new Date(file.modifiedTime).toLocaleString()}</td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onToggleStar(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                    >
                      <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => onShareFile(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDownloadFile(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
