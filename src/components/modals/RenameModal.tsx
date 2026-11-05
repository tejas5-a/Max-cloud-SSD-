import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import type { CloudFile } from '../../types';

interface RenameModalProps {
  file: CloudFile | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (fileId: string, newName: string, provider: CloudFile['provider']) => void;
  isProcessing: boolean;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  file,
  isOpen,
  onClose,
  onRename,
  isProcessing,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (file) {
      setName(file.name);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === file.name) return;
    onRename(file.id, name.trim(), file.provider);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-5 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Edit2 className="w-4 h-4 text-orange-400" />
            <span>Rename {file.isFolder ? 'Folder' : 'File'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">New Name</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#10172A] border border-[#1E293B] focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name === file.name || isProcessing}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
            >
              {isProcessing ? 'Saving...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
