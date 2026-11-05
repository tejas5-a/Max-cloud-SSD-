import React, { useState } from 'react';
import {
  ArrowUpDown,
  Upload,
  Download,
  Pause,
  Play,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  HardDrive,
  Cloud,
} from 'lucide-react';
import type { TransferItem, TransferStatus } from '../../types';

interface TransfersViewProps {
  items: TransferItem[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onClearCompleted: () => void;
  onOpenUploadModal: () => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  items,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onClearCompleted,
  onOpenUploadModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  const filteredItems = items.filter((item) => {
    if (filter === 'active') return item.status === 'in_progress' || item.status === 'queued' || item.status === 'paused';
    if (filter === 'completed') return item.status === 'completed';
    if (filter === 'failed') return item.status === 'failed' || item.status === 'cancelled';
    return true;
  });

  const activeCount = items.filter((i) => i.status === 'in_progress').length;
  const totalSpeedBps = items
    .filter((i) => i.status === 'in_progress')
    .reduce((acc, i) => acc + (i.speedBps || 0), 0);

  const formatSpeed = (bps: number) => {
    if (bps === 0) return '0 KB/s';
    if (bps < 1024 * 1024) return (bps / 1024).toFixed(1) + ' KB/s';
    return (bps / (1024 * 1024)).toFixed(1) + ' MB/s';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const calculateEta = (item: TransferItem) => {
    if (item.status !== 'in_progress' || !item.speedBps || item.speedBps === 0) return '—';
    const remainingBytes = item.sizeBytes - item.transferredBytes;
    if (remainingBytes <= 0) return 'Finishing...';
    const seconds = Math.round(remainingBytes / item.speedBps);
    if (seconds < 60) return `${seconds}s remaining`;
    return `${Math.ceil(seconds / 60)}m remaining`;
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto select-none">
      {/* Header & Speed Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Transfer Manager</h1>
            <p className="text-xs text-slate-400">
              Chunked asynchronous streaming queue with retry policies and Win32 x86 thread throttling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active throughput badge */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Speed:</span>
            <span className="text-orange-400 font-bold font-mono">{formatSpeed(totalSpeedBps)}</span>
          </div>

          <button
            onClick={onClearCompleted}
            className="px-3 py-1.5 rounded-xl bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold shadow-md shadow-orange-950/40 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {(['all', 'active', 'completed', 'failed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full capitalize font-semibold transition-all ${
              filter === tab
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[#141E34] text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
            {tab === 'active' && activeCount > 0 && ` (${activeCount})`}
          </button>
        ))}
      </div>

      {/* Transfer Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <ArrowUpDown className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No transfers in this view</div>
          <div className="text-xs text-slate-500">
            Upload or download files to view real-time streaming progress, transfer rates, and integrity checks.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3 transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${
                      item.type === 'upload'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {item.type === 'upload' ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200 truncate max-w-md">{item.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{item.type}</span>
                      <span>•</span>
                      <span className="uppercase font-mono text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                        {item.provider}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{formatSize(item.sizeBytes)}</span>
                      {item.status === 'in_progress' && (
                        <>
                          <span>•</span>
                          <span className="text-orange-400 font-mono font-medium">{formatSpeed(item.speedBps)}</span>
                          <span>•</span>
                          <span className="text-slate-400">{calculateEta(item)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Control buttons */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      item.status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'in_progress'
                        ? 'bg-orange-950/60 text-orange-400 border border-orange-500/30 animate-pulse'
                        : item.status === 'paused'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : item.status === 'failed'
                        ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-1">
                    {item.status === 'in_progress' && item.canPauseResume && (
                      <button
                        onClick={() => onPause(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Pause"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.status === 'paused' && (
                      <button
                        onClick={() => onResume(item.id)}
                        className="p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-slate-800"
                        title="Resume"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.status === 'failed' && (
                      <button
                        onClick={() => onRetry(item.id)}
                        className="p-1.5 rounded-lg text-orange-400 hover:text-white hover:bg-slate-800"
                        title="Retry"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {(item.status === 'in_progress' || item.status === 'queued') && (
                      <button
                        onClick={() => onCancel(item.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-slate-800"
                        title="Cancel"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500'
                        : item.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${item.progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>
                    {formatSize(item.transferredBytes)} of {formatSize(item.sizeBytes)}
                  </span>
                  <span>{item.progressPercent}%</span>
                </div>
              </div>

              {item.error && (
                <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.error}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
