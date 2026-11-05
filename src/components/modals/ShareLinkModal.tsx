import React, { useState } from 'react';
import { Share2, Copy, Check, Globe, Shield, X, ExternalLink } from 'lucide-react';
import type { CloudFile } from '../../types';
import { GoogleDriveService } from '../../services/googleDrive';

interface ShareLinkModalProps {
  file: CloudFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ file, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<'reader' | 'commenter' | 'writer'>('reader');
  const [link, setLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      if (file.provider === 'googledrive') {
        const generated = await GoogleDriveService.createShareLink(file.id, role);
        setLink(generated);
      } else {
        // Local SSD files are local to the machine
        setLink(`maxcloudssd://local-file/${encodeURIComponent(file.id)}`);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-5 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Share2 className="w-4 h-4 text-orange-400" />
            <span>Share & Permissions</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="p-2.5 rounded-xl bg-[#141E34] border border-[#1E293B] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">{file.name}</div>
              <div className="text-[10px] text-slate-400">Provider: {file.provider === 'googledrive' ? 'Google Drive' : 'Local SSD'}</div>
            </div>
          </div>

          {file.provider === 'googledrive' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Access Permission</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as any);
                    setLink('');
                  }}
                  className="w-full bg-[#10172A] border border-[#1E293B] focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="reader">Viewer (Can view and download)</option>
                  <option value="commenter">Commenter (Can comment)</option>
                  <option value="writer">Editor (Can edit and share)</option>
                </select>
              </div>

              {!link ? (
                <button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating Official Google Link...' : 'Create Public Share Link'}</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[11px] text-emerald-400 font-medium">Link Ready to Share</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={link}
                      className="flex-1 bg-[#080D17] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-slate-300 select-all font-mono"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-orange-400 hover:underline pt-1"
                  >
                    <span>Open link in browser</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400">
              This file resides on your local machine cache. To create a public cloud share link, upload or sync it to your connected Google Drive account.
            </div>
          )}

          {error && <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-400">{error}</div>}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1E293B]">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white border border-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
