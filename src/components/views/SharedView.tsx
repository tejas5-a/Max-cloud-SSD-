import React from 'react';
import { Share2, Download, Eye, Globe, ExternalLink, HardDrive, Cloud } from 'lucide-react';
import type { CloudFile } from '../../types';

interface SharedViewProps {
  files: CloudFile[];
  onOpenFilePreview: (file: CloudFile) => void;
  onDownloadFile: (file: CloudFile) => void;
  onShareFile: (file: CloudFile) => void;
}

export const SharedView: React.FC<SharedViewProps> = ({
  files,
  onOpenFilePreview,
  onDownloadFile,
  onShareFile,
}) => {
  // Shared files in Google Drive or files with webViewLink
  const sharedFiles = files.filter((f) => (f.shared || f.webViewLink) && !f.trashed);

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
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Shared Files & Links</h1>
            <p className="text-xs text-slate-400">Collaborative files shared with external teammates or public web viewers</p>
          </div>
        </div>
        <span className="text-xs text-purple-400 font-mono font-semibold">{sharedFiles.length} items</span>
      </div>

      {sharedFiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <Globe className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No shared files yet</div>
          <div className="text-xs text-slate-500">
            Select any file in My Files and click "Share Link" to create public or reader links.
          </div>
        </div>
      ) : (
        <div className="border border-[#1E293B] rounded-2xl bg-[#0F172A] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1D] text-slate-400 font-semibold border-b border-[#1E293B]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Sharing Status</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {sharedFiles.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => onOpenFilePreview(file)}
                  className="hover:bg-[#141E34] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-semibold text-slate-200 truncate max-w-md">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{formatSize(file.sizeBytes)}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-[10px] text-purple-300">
                      <Globe className="w-3 h-3" />
                      <span>Anyone with link</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      <Cloud className="w-3 h-3 text-blue-400" />
                      <span>Google Drive</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onShareFile(file)}
                        className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] text-[11px] font-medium"
                      >
                        Manage Link
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
