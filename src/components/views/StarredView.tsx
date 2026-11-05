import React from 'react';
import { Star, Download, Eye, Share2, FileText, HardDrive, Cloud } from 'lucide-react';
import type { CloudFile } from '../../types';

interface StarredViewProps {
  files: CloudFile[];
  onOpenFilePreview: (file: CloudFile) => void;
  onDownloadFile: (file: CloudFile) => void;
  onToggleStar: (file: CloudFile) => void;
  onShareFile: (file: CloudFile) => void;
}

export const StarredView: React.FC<StarredViewProps> = ({
  files,
  onOpenFilePreview,
  onDownloadFile,
  onToggleStar,
  onShareFile,
}) => {
  const starredFiles = files.filter((f) => f.starred && !f.trashed);

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
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Starred Files</h1>
            <p className="text-xs text-slate-400">Important pinned files stored locally in SQLite and synced with cloud providers</p>
          </div>
        </div>
        <span className="text-xs text-amber-400 font-mono font-semibold">{starredFiles.length} starred</span>
      </div>

      {starredFiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <Star className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No starred files yet</div>
          <div className="text-xs text-slate-500">Click the star icon on any file to bookmark it for fast offline access.</div>
        </div>
      ) : (
        <div className="border border-[#1E293B] rounded-2xl bg-[#0F172A] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1D] text-slate-400 font-semibold border-b border-[#1E293B]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-3">Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {starredFiles.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => onOpenFilePreview(file)}
                  className="hover:bg-[#141E34] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-amber-400 fill-current shrink-0" />
                      <span className="font-semibold text-slate-200 truncate max-w-md">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{formatSize(file.sizeBytes)}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {file.provider === 'googledrive' ? <Cloud className="w-3 h-3 text-blue-400" /> : <HardDrive className="w-3 h-3 text-orange-400" />}
                      <span className="capitalize">{file.provider}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{new Date(file.modifiedTime).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onToggleStar(file)}
                        className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800"
                        title="Unstar"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
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
      )}
    </div>
  );
};
