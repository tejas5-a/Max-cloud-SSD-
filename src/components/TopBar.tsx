import React, { useState } from 'react';
import {
  Search,
  Upload,
  Bell,
  FolderPlus,
  ChevronDown,
  LogOut,
  RefreshCw,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { ActivityLog } from '../types';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenUploadModal: () => void;
  onOpenNewFolderModal: () => void;
  currentUser: User | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  activities: ActivityLog[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUploadModal,
  onOpenNewFolderModal,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  isLoggingIn,
  activities,
  onRefresh,
  isRefreshing,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  return (
    <header className="h-14 bg-[#0A0F1D]/90 backdrop-blur-md border-b border-[#1E293B] flex items-center justify-between px-6 z-40 select-none">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search all files across Google Drive & Local SSD..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#10172A] border border-[#1E293B] focus:border-orange-500 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200 px-1 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action buttons on the right */}
      <div className="flex items-center gap-3">
        {/* Refresh Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131C31] border border-[#1E293B] transition-colors ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh cloud drives and local metadata"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
        </button>

        {/* Upload Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-orange-950/40 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {showUploadMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowUploadMenu(false);
                  onOpenUploadModal();
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-orange-500/10 hover:text-orange-400 flex items-center gap-2.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-orange-400" />
                <span>Upload Files</span>
              </button>
              <button
                onClick={() => {
                  setShowUploadMenu(false);
                  onOpenNewFolderModal();
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-orange-500/10 hover:text-orange-400 flex items-center gap-2.5 transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>New Folder</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131C31] border border-[#1E293B] transition-colors"
            title="System & Transfer Activity"
          >
            <Bell className="w-4 h-4" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[#0A0F1D]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] mb-2">
                <span className="text-xs font-semibold text-slate-200">Activity Log</span>
                <span className="text-[10px] text-slate-400">{activities.length} events</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {activities.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">No recent activity</div>
                ) : (
                  activities.slice(0, 8).map((act) => (
                    <div key={act.id} className="p-2 rounded-lg bg-[#141E34] border border-[#1E293B]/70 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-200">
                        <span className="truncate pr-2">{act.fileName}</span>
                        {act.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{act.details || act.action}</div>
                      <div className="text-[9px] text-slate-500 mt-1">{new Date(act.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Google Sign-in */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#131C31] border border-[#1E293B] hover:border-orange-500/50 transition-colors"
            >
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-slate-200 font-medium max-w-[110px] truncate">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="pb-3 border-b border-[#1E293B]">
                  <div className="text-xs font-semibold text-slate-200">{currentUser.displayName || 'Connected Account'}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser.email}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-400 font-medium">
                    <Cloud className="w-3 h-3" />
                    <span>Google Drive Synced</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Google Drive</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Official Google Drive Sign-In button */
          <button
            onClick={onSignInWithGoogle}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-sm transition-all border border-slate-300"
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
    </header>
  );
};
