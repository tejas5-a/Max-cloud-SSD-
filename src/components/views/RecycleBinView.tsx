import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, HardDrive, Cloud } from 'lucide-react';
import type { CloudFile } from '../../types';

interface RecycleBinViewProps {
  files: CloudFile[];
  onRestore: (file: CloudFile) => void;
  onDeletePermanently: (files: CloudFile[]) => void;
  onEmptyTrash: () => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  files,
  onRestore,
  onDeletePermanently,
  onEmptyTrash,
}) => {
  const trashedFiles = files.filter((f) => f.trashed);

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
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Recycle Bin</h1>
            <p className="text-xs text-slate-400">
              Trashed items from connected cloud drives and local storage. Items can be restored or permanently purged.
            </p>
          </div>
        </div>

        {trashedFiles.length > 0 && (
          <button
            onClick={onEmptyTrash}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {trashedFiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <Trash2 className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">Recycle Bin is empty</div>
          <div className="text-xs text-slate-500">Deleted files will appear here before being permanently destroyed.</div>
        </div>
      ) : (
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
              {trashedFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#141E34] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-semibold text-slate-300 truncate max-w-md">{file.name}</span>
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
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onRestore(file)}
                        className="px-3 py-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/20 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        title="Restore to original folder"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => onDeletePermanently([file])}
                        className="px-3 py-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 border border-red-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        title="Delete permanently from cloud"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
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
