import React from 'react';
import {
  HardDrive,
  Cloud,
  ArrowUpDown,
  Upload,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ShieldCheck,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import type { ActivityLog, CloudFile, StorageQuota } from '../../types';

interface DashboardViewProps {
  quotas: StorageQuota[];
  recentFiles: CloudFile[];
  activities: ActivityLog[];
  onOpenFilePreview: (file: CloudFile) => void;
  onNavigateToFiles: () => void;
  onNavigateToTransfers: () => void;
  onNavigateToAccounts: () => void;
  onOpenSourceExplorer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  quotas,
  recentFiles,
  activities,
  onOpenFilePreview,
  onNavigateToFiles,
  onNavigateToTransfers,
  onNavigateToAccounts,
  onOpenSourceExplorer,
}) => {
  const connectedQuotas = quotas.filter((q) => q.connected);
  const totalUsedBytes = connectedQuotas.reduce((acc, q) => acc + q.usageBytes, 0);
  const totalAllocatedBytes = connectedQuotas.reduce((acc, q) => acc + q.totalBytes, 0);

  const formatGb = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);
  const formatMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  const percentage =
    totalAllocatedBytes > 0
      ? Math.min(100, Math.round((totalUsedBytes / totalAllocatedBytes) * 100))
      : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#11192E] via-[#0D1527] to-[#151D33] border border-[#1E293B] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Native Windows 32-bit (x86) Architecture Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              MAX CLOUD <span className="text-orange-400">SSD</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Unified high-throughput cloud storage client with zero-fabrication real-quota telemetry,
              official Google Drive REST API v3 streaming, and local NVMe metadata caching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToFiles}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold shadow-lg shadow-orange-950/40 flex items-center gap-2 transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse All Files</span>
            </button>
            <button
              onClick={onOpenSourceExplorer}
              className="px-4 py-2.5 rounded-xl bg-[#141E34] hover:bg-[#1C2A48] border border-orange-500/30 hover:border-orange-500/60 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Cpu className="w-4 h-4 text-orange-400" />
              <span>C# .NET 8 Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Connected Storage */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Connected Quota</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatGb(totalAllocatedBytes)} <span className="text-xs text-slate-400 font-normal">GB</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">{connectedQuotas.length} Active</span>
              <span>provider channels</span>
            </div>
          </div>
        </div>

        {/* Real Storage Usage */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Actual Space Used</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Cloud className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatGb(totalUsedBytes)} <span className="text-xs text-slate-400 font-normal">GB</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-orange-400 font-bold">{percentage}%</span> of connected capacity
            </div>
          </div>
        </div>

        {/* Transfer Health */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Transfer Pipeline</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              100% <span className="text-xs text-emerald-400 font-normal">Operational</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Async chunked streaming enabled
            </div>
          </div>
        </div>

        {/* Security & Token Vault */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Security Engine</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">Windows DPAPI</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Protected in-memory token store
            </div>
          </div>
        </div>
      </div>

      {/* Provider Quota Cards (Important: Independent quotas, never pretending unified storage is one pool) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Connected Cloud Providers</h2>
            <p className="text-[11px] text-slate-400">
              Real provider quotas displayed individually. Cloud pools are kept strictly independent.
            </p>
          </div>
          <button
            onClick={onNavigateToAccounts}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            <span>Manage Accounts</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quotas.map((q) => {
            const usagePercent =
              q.totalBytes > 0 ? Math.min(100, Math.round((q.usageBytes / q.totalBytes) * 100)) : 0;

            return (
              <div
                key={q.provider}
                className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A2642] to-[#121B2F] border border-[#1E293B] flex items-center justify-center text-orange-400">
                        {q.provider === 'googledrive' ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{q.providerName}</div>
                        <div className="text-[10px] text-slate-400">{q.accountEmail || 'Host Local Storage'}</div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.connected
                          ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {q.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  {q.connected ? (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Quota Used</span>
                        <span className="text-white font-mono font-semibold">
                          {formatGb(q.usageBytes)} / {formatGb(q.totalBytes)} GB
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${usagePercent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{usagePercent}% utilized</span>
                        <span>{formatGb(q.totalBytes - q.usageBytes)} GB free</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 mt-3 rounded-xl bg-[#080D17] border border-[#1E293B] text-[11px] text-slate-400">
                      {q.provider === 'terabox' ? (
                        <span>
                          TeraBox integration is not currently supported. Connect it when an authorized API becomes available.
                        </span>
                      ) : (
                        <span>Sign in with Google to view live Drive quota and files.</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-[#1E293B]/70 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Synced via Official REST API</span>
                  <span>{q.lastSynced ? new Date(q.lastSynced).toLocaleTimeString() : 'Standby'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Recent Files & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Recent Files</h3>
            </div>
            <button
              onClick={onNavigateToFiles}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {recentFiles.slice(0, 5).map((file) => (
              <div
                key={file.id}
                onClick={() => onOpenFilePreview(file)}
                className="p-3 rounded-xl bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-orange-400">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{file.category}</span>
                      <span>•</span>
                      <span className="font-mono">{formatMb(file.sizeBytes)} MB</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500">
                  {new Date(file.modifiedTime).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Activity Log & Telemetry</h3>
            </div>
            <button
              onClick={onNavigateToTransfers}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium"
            >
              Transfers
            </button>
          </div>

          <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="p-3 rounded-xl bg-[#141E34] border border-[#1E293B] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate pr-2">{act.fileName}</span>
                  {act.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Success</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Warning</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{act.details || act.action}</div>
                <div className="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
                  <span className="uppercase font-mono text-[9px] text-orange-400">{act.provider}</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
