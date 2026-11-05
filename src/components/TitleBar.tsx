import React, { useState } from 'react';
import { HardDrive, Minus, Square, X, ShieldCheck, Cpu } from 'lucide-react';

interface TitleBarProps {
  onOpenSourceExplorer: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenSourceExplorer }) => {
  const [isMaximized, setIsMaximized] = useState(true);

  return (
    <div className="h-9 bg-[#080D17] border-b border-[#1E293B] flex items-center justify-between px-3 select-none text-xs text-slate-400 z-50">
      {/* Left: Brand icon and title */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5 rounded bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
          <HardDrive className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold tracking-wide text-slate-200">MAX CLOUD SSD</span>
        <span className="text-[10px] text-slate-500">v2.4.0</span>

        <span className="mx-1 text-slate-600">|</span>

        {/* Windows x86 32-bit Architecture Badge */}
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-950/40 border border-orange-500/30 text-[10px] text-orange-400 font-mono">
          <Cpu className="w-2.5 h-2.5" />
          <span>Win32 x86 (Release)</span>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40 text-[10px] text-emerald-400">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>DPAPI Protected</span>
        </div>
      </div>

      {/* Center: Quick action for Source Code inspection */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={onOpenSourceExplorer}
          className="text-[11px] text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800/80"
          title="Inspect the C# .NET 8 WPF x86 project files"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          <span>C# .NET 8 WPF Source Code</span>
        </button>
      </div>

      {/* Right: Windows Window Controls */}
      <div className="flex items-center -mr-3">
        <button
          className="w-10 h-9 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Minimize"
          onClick={() => {}}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-10 h-9 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
          onClick={() => setIsMaximized(!isMaximized)}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          className="w-11 h-9 flex items-center justify-center hover:bg-red-600 hover:text-white text-slate-400 transition-colors"
          title="Close (Exit to System Tray)"
          onClick={() => {}}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
