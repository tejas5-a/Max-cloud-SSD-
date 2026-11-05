import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import type { CloudProviderId } from '../../types';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, provider: CloudProviderId) => void;
  defaultProvider: CloudProviderId;
  isProcessing: boolean;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultProvider,
  isProcessing,
}) => {
  const [folderName, setFolderName] = useState('');
  const [provider, setProvider] = useState<CloudProviderId>(defaultProvider);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreate(folderName.trim(), provider);
    setFolderName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-5 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FolderPlus className="w-4 h-4 text-orange-400" />
            <span>Create New Folder</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Folder Name</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Project Assets"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-[#10172A] border border-[#1E293B] focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Target Storage Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as CloudProviderId)}
              className="w-full bg-[#10172A] border border-[#1E293B] focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="googledrive">Google Drive</option>
              <option value="localssd">MAX Local SSD Cache</option>
            </select>
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
              disabled={!folderName.trim() || isProcessing}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
            >
              {isProcessing ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
