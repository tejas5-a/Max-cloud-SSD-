import React, { useState } from 'react';
import {
  Cloud,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Info,
  Server,
  FileCheck,
} from 'lucide-react';
import type { StorageQuota } from '../../types';
import { TERABOX_AUDIT_REPORT, TERABOX_UNSUPPORTED_MESSAGE } from '../../services/terabox';

interface CloudAccountsViewProps {
  quotas: StorageQuota[];
  onSignInWithGoogle: () => void;
  onSignOutGoogle: () => void;
  isLoggingIn: boolean;
  onRefreshQuotas: () => void;
  isRefreshing: boolean;
}

export const CloudAccountsView: React.FC<CloudAccountsViewProps> = ({
  quotas,
  onSignInWithGoogle,
  onSignOutGoogle,
  isLoggingIn,
  onRefreshQuotas,
  isRefreshing,
}) => {
  const [showTeraBoxAudit, setShowTeraBoxAudit] = useState(false);

  const googleQuota = quotas.find((q) => q.provider === 'googledrive');
  const localQuota = quotas.find((q) => q.provider === 'localssd');
  const teraboxQuota = quotas.find((q) => q.provider === 'terabox');

  const formatGb = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Connected Cloud Accounts</h1>
            <p className="text-xs text-slate-400">
              Provider-based multi-cloud storage management with authentic REST API connections
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshQuotas}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] text-slate-200 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          <span>Sync Quotas</span>
        </button>
      </div>

      {/* Crucial Multi-Storage Notice */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex items-start gap-3.5">
        <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">Independent Storage Architecture</div>
          <p className="text-slate-400 leading-relaxed">
            MAX CLOUD SSD displays individual provider quotas and their combined theoretical capacity
            separately. Individual cloud providers (Google Drive, Local SSD) maintain isolated storage buckets;
            individual files cannot span across providers.
          </p>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PROVIDER A: Google Drive */}
        <div className="rounded-2xl bg-[#0F172A] border border-[#1E293B] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Drive</h3>
                  <span className="text-[10px] text-slate-400">Official REST API v3</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  googleQuota?.connected
                    ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {googleQuota?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {googleQuota?.connected ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-[#080D17] border border-[#1E293B]">
                  <div className="text-[11px] text-slate-400 font-medium">Authorized Account</div>
                  <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                    {googleQuota.accountName || 'Google User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                    {googleQuota.accountEmail}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Storage Used</span>
                    <span className="text-white font-mono font-semibold">
                      {formatGb(googleQuota.usageBytes)} / {formatGb(googleQuota.totalBytes)} GB
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((googleQuota.usageBytes / googleQuota.totalBytes) * 100)
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#080D17] border border-[#1E293B] text-xs text-slate-400 space-y-2">
                <p>
                  Connect your Google account using secure OAuth 2.0 to browse, upload, download, and manage your Drive files.
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tokens protected via Windows DPAPI</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#1E293B]">
            {googleQuota?.connected ? (
              <button
                onClick={onSignOutGoogle}
                className="w-full py-2 px-3 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Google Drive</span>
              </button>
            ) : (
              <button
                onClick={onSignInWithGoogle}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 shadow transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Connecting...' : 'Connect Google Drive'}</span>
              </button>
            )}
          </div>
        </div>

        {/* PROVIDER B: TeraBox (Investigation & Status per prompt) */}
        <div className="rounded-2xl bg-[#0F172A] border border-[#1E293B] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">TeraBox Cloud</h3>
                  <span className="text-[10px] text-slate-400">Provider Module Ready</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 border border-amber-500/30 text-amber-400">
                Pending Official API
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#080D17] border border-[#1E293B] text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px]">
                <AlertTriangle className="w-4 h-4" />
                <span>API Status Notice</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                "{TERABOX_UNSUPPORTED_MESSAGE}"
              </p>
              <p className="text-[10px] text-slate-500">
                TeraBox does not offer an official public OAuth 2.0 REST API for 3rd-party personal clients.
                Per our security charter, we do not reverse-engineer private endpoints or scrape login sessions.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B]">
            <button
              onClick={() => setShowTeraBoxAudit(!showTeraBoxAudit)}
              className="w-full py-2 px-3 rounded-xl bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{showTeraBoxAudit ? 'Hide Audit Report' : 'View Feasibility Report'}</span>
            </button>
          </div>
        </div>

        {/* PROVIDER C: Local SSD & Metadata Cache */}
        <div className="rounded-2xl bg-[#0F172A] border border-[#1E293B] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">MAX Local SSD</h3>
                  <span className="text-[10px] text-slate-400">NVMe High-Speed Cache</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                Active
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-[#080D17] border border-[#1E293B]">
                <div className="text-[11px] text-slate-400 font-medium">Local Mount</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  Host Machine Win32 Partition
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  SQLite v3.45 Engine
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cache Partition</span>
                  <span className="text-white font-mono font-semibold">
                    {formatGb(localQuota?.usageBytes || 0)} / {formatGb(localQuota?.totalBytes || 0)} GB
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((localQuota?.usageBytes || 0) / (localQuota?.totalBytes || 1)) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B]">
            <div className="text-[10px] text-emerald-400 flex items-center justify-center gap-1.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Offline Cache Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* TeraBox Audit Modal / Drawer if toggled */}
      {showTeraBoxAudit && (
        <div className="p-6 rounded-2xl bg-[#080D17] border border-amber-500/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <FileCheck className="w-5 h-5" />
              <span>TeraBox Official API Feasibility Assessment (November 2026)</span>
            </div>
            <button
              onClick={() => setShowTeraBoxAudit(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px] mb-1">Public Personal API Status</span>
              <span className="text-amber-400 font-semibold">{TERABOX_AUDIT_REPORT.apiStatus}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px] mb-1">Terms of Service Compliance</span>
              <span className="text-emerald-400 font-semibold">{TERABOX_AUDIT_REPORT.termsOfServiceCompliance}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] col-span-2">
              <span className="text-slate-400 block text-[11px] mb-1">Architectural Recommendation</span>
              <p className="text-slate-300 leading-relaxed">{TERABOX_AUDIT_REPORT.recommendedAction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
