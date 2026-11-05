import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { CloudFile } from '../../types';

interface ConfirmDeleteModalProps {
  files: CloudFile[];
  isPermanent: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  files,
  isPermanent,
  onConfirm,
  onCancel,
  isProcessing,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0F172A] border border-red-500/30 rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 text-red-400 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{isPermanent ? 'Confirm Permanent Deletion' : 'Move to Recycle Bin'}</span>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            {isPermanent ? (
              <>
                Are you sure you want to <strong>permanently delete</strong> the following{' '}
                <span className="text-red-400 font-bold">{files.length} item(s)</span>? This action cannot be
                undone and will remove the data permanently from your cloud storage.
              </>
            ) : (
              <>
                Are you sure you want to move the following{' '}
                <span className="text-amber-400 font-bold">{files.length} item(s)</span> to the Recycle Bin?
              </>
            )}
          </p>

          <div className="max-h-40 overflow-y-auto rounded-lg bg-[#080D17] border border-[#1E293B] p-2 space-y-1">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-[#10192E]">
                <span className="truncate pr-2 text-slate-200">{file.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{file.provider}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-950/40"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isProcessing ? 'Deleting...' : isPermanent ? 'Delete Permanently' : 'Move to Recycle Bin'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
