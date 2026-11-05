import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  Star,
  Share2,
  Cloud,
  ArrowUpDown,
  Trash2,
  Settings,
  HardDrive,
  Code2,
} from 'lucide-react';
import type { StorageQuota } from '../types';

export type NavView =
  | 'dashboard'
  | 'my_files'
  | 'recent'
  | 'starred'
  | 'shared'
  | 'accounts'
  | 'transfers'
  | 'recycle_bin'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  activeTransfersCount: number;
  quotas: StorageQuota[];
  onOpenSourceExplorer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeTransfersCount,
  quotas,
  onOpenSourceExplorer,
}) => {
  const navItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my_files', label: 'My Files', icon: FolderOpen },
    { id: 'recent', label: 'Recent Files', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'shared', label: 'Shared', icon: Share2 },
    { id: 'accounts', label: 'Cloud Accounts', icon: Cloud },
    { id: 'transfers', label: 'Transfers', icon: ArrowUpDown, badge: activeTransfersCount > 0 ? activeTransfersCount : undefined },
    { id: 'recycle_bin', label: 'Recycle Bin', icon: Trash2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Combined real usage calculation across connected providers
  const connectedQuotas = quotas.filter((q) => q.connected);
  const totalUsedBytes = connectedQuotas.reduce((acc, q) => acc + q.usageBytes, 0);
  const totalAllocatedBytes = connectedQuotas.reduce((acc, q) => acc + q.totalBytes, 0);
  const percentage = totalAllocatedBytes > 0 ? Math.min(100, Math.round((totalUsedBytes / totalAllocatedBytes) * 100)) : 0;

  const formatGb = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <aside className="w-64 bg-[#0A0F1D] border-r border-[#1E293B] flex flex-col justify-between select-none">
      {/* Top: Logo & Nav items */}
      <div className="p-3">
        {/* Brand header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-[#121B2F] to-[#0D1526] border border-[#1E293B]/70 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-950/40">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>MAX CLOUD</span>
              <span className="text-orange-400 font-extrabold">SSD</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Unified Cloud Drive</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-0.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-950/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#131C31]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Storage summary & Source code launcher */}
      <div className="p-3 border-t border-[#1E293B]/80 space-y-3">
        {/* Storage usage mini card */}
        <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
              <span>Storage Used</span>
            </span>
            <span className="text-orange-400 font-bold">{percentage}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{formatGb(totalUsedBytes)} GB used</span>
            <span>{formatGb(totalAllocatedBytes)} GB total</span>
          </div>
        </div>

        {/* C# Source Code Explorer button */}
        <button
          onClick={onOpenSourceExplorer}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#141E34] hover:bg-[#1A2642] border border-orange-500/30 hover:border-orange-500/60 text-slate-200 text-xs font-medium transition-all group"
        >
          <Code2 className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-12 transition-transform" />
          <span>View C# .NET 8 Project</span>
        </button>
      </div>
    </aside>
  );
};
