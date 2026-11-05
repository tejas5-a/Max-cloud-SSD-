import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Download,
  Copy,
  Check,
  X,
  Folder,
  Layers,
  Terminal,
  ShieldAlert,
  Cpu,
} from 'lucide-react';
import { CSHARP_PROJECT_FILES, generateProjectZip, type CSharpFileEntry } from '../../services/csharpProjectData';

interface CsharpSourceExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsharpSourceExplorerModal: React.FC<CsharpSourceExplorerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<CSharpFileEntry>(CSHARP_PROJECT_FILES[1]); // default App.csproj
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const blob = await generateProjectZip();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MAXCloudSSD-dotnet8-WPF-x86-source.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Failed to create zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[88vh] bg-[#0A0F1D] border border-orange-500/40 rounded-2xl shadow-2xl flex flex-col text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#1E293B] bg-[#080D17]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">MAX CLOUD SSD — C# .NET 8 WPF Source Code Explorer</h2>
                <span className="px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/40 text-[10px] text-orange-400 font-mono">
                  Win32 x86 Target
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Complete, compilable desktop solution architecture targeting native 32-bit Windows executables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold shadow-md shadow-orange-950/40 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Generating ZIP...' : 'Download Complete Solution (.ZIP)'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace: File Tree on left, Code on right */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-72 bg-[#0F172A] border-r border-[#1E293B] p-3 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                <span>Solution Explorer</span>
                <span className="text-[10px] text-orange-400 font-mono">{CSHARP_PROJECT_FILES.length} Files</span>
              </div>

              {CSHARP_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-orange-500/15 border border-orange-500/40 text-orange-300'
                        : 'text-slate-400 hover:bg-[#141E34] hover:text-slate-200'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-orange-400' : 'text-slate-500'}`} />
                    <div className="truncate min-w-0">
                      <div className="truncate text-xs font-medium">{file.path.split('/').pop()}</div>
                      <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Build command tip */}
            <div className="p-3 mt-4 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-[10px] text-slate-400 space-y-1 font-mono">
              <div className="text-orange-400 font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                <span>Publish Command:</span>
              </div>
              <div className="text-slate-300 break-all select-all bg-slate-900/80 p-1.5 rounded">
                dotnet publish -c Release -r win-x86 -p:PlatformTarget=x86
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 bg-[#080D17] flex flex-col overflow-hidden">
            {/* File info bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E293B] bg-[#0A0F1D] text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <span className="text-orange-400 font-bold">{selectedFile.path}</span>
                <span className="text-slate-500">—</span>
                <span className="text-slate-400">{selectedFile.description}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141E34] hover:bg-[#1C2A48] border border-[#1E293B] text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code editor preview */}
            <pre className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 leading-relaxed bg-[#080D17] select-text">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
