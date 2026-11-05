/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { TitleBar } from './components/TitleBar';
import { Sidebar, type NavView } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { FilesView } from './components/views/FilesView';
import { RecentFilesView } from './components/views/RecentFilesView';
import { StarredView } from './components/views/StarredView';
import { SharedView } from './components/views/SharedView';
import { CloudAccountsView } from './components/views/CloudAccountsView';
import { TransfersView } from './components/views/TransfersView';
import { RecycleBinView } from './components/views/RecycleBinView';
import { SettingsView } from './components/views/SettingsView';

import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { NewFolderModal } from './components/modals/NewFolderModal';
import { RenameModal } from './components/modals/RenameModal';
import { ShareLinkModal } from './components/modals/ShareLinkModal';
import { UploadModal } from './components/modals/UploadModal';
import { FilePreviewModal } from './components/modals/FilePreviewModal';
import { CsharpSourceExplorerModal } from './components/modals/CsharpSourceExplorerModal';

import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebase';
import { GoogleDriveService } from './services/googleDrive';
import { LocalDbService } from './services/localDb';
import { transferEngine } from './services/transferEngine';
import { TeraBoxProvider } from './services/terabox';
import type {
  ActivityLog,
  AppSettings,
  CloudFile,
  CloudProviderId,
  StorageQuota,
  TransferItem,
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<CloudProviderId | 'all'>('all');

  // Files & Quotas
  const [googleFiles, setGoogleFiles] = useState<CloudFile[]>([]);
  const [localFiles, setLocalFiles] = useState<CloudFile[]>(() => LocalDbService.getLocalFiles());
  const [quotas, setQuotas] = useState<StorageQuota[]>([
    LocalDbService.getLocalSsdQuota(),
    TeraBoxProvider.getQuota(),
  ]);
  const [activities, setActivities] = useState<ActivityLog[]>(() =>
    LocalDbService.getRecentActivities()
  );
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => LocalDbService.getSettings());

  // Folder navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([]);

  // Modals state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<CloudFile | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTargetFile, setRenameTargetFile] = useState<CloudFile | null>(null);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTargetFile, setShareTargetFile] = useState<CloudFile | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetFiles, setDeleteTargetFiles] = useState<CloudFile[]>([]);
  const [isDeletePermanent, setIsDeletePermanent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSourceExplorerOpen, setIsSourceExplorerOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Subscribe to Transfers
  useEffect(() => {
    const unsub = transferEngine.subscribe((items) => {
      setTransfers(items);
    });
    return unsub;
  }, []);

  // Sync Google Drive files & quota
  const syncGoogleDrive = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    setIsRefreshing(true);
    setActionError(null);
    try {
      const [driveQuota, driveFiles] = await Promise.all([
        GoogleDriveService.getStorageQuota(),
        GoogleDriveService.listFiles({ folderId: null }),
      ]);

      setGoogleFiles(driveFiles);
      setQuotas([driveQuota, LocalDbService.getLocalSsdQuota(), TeraBoxProvider.getQuota()]);

      LocalDbService.logActivity({
        id: 'act-sync-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'connect',
        fileName: 'Google Drive v3 Synchronized',
        provider: 'googledrive',
        status: 'success',
        details: `Loaded ${driveFiles.length} cloud files. Real quota: ${(driveQuota.usageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB used.`,
      });
      setActivities(LocalDbService.getRecentActivities());
    } catch (err: any) {
      console.error('Failed to sync Google Drive:', err);
      setActionError(err.message || 'Failed to sync with Google Drive');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initialize Auth
  useEffect(() => {
    const unsub = initAuth(
      (user, _token) => {
        setCurrentUser(user);
        syncGoogleDrive();
      },
      () => {
        setCurrentUser(null);
        setQuotas([LocalDbService.getLocalSsdQuota(), TeraBoxProvider.getQuota()]);
      }
    );
    return unsub;
  }, [syncGoogleDrive]);

  // Handle Google Drive OAuth sign-in
  const handleSignInGoogle = async () => {
    setIsLoggingIn(true);
    setActionError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        await syncGoogleDrive();
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setActionError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOutGoogle = async () => {
    await logout();
    setCurrentUser(null);
    setGoogleFiles([]);
    setQuotas([LocalDbService.getLocalSsdQuota(), TeraBoxProvider.getQuota()]);
    LocalDbService.logActivity({
      id: 'act-out-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'connect',
      fileName: 'Google Drive Disconnected',
      provider: 'googledrive',
      status: 'warning',
      details: 'Wiped local session credentials from memory',
    });
    setActivities(LocalDbService.getRecentActivities());
  };

  // Combine files from all providers
  const allFiles: CloudFile[] = React.useMemo(() => {
    const starredSet = LocalDbService.getStarredIds();
    const mappedLocal = localFiles.map((f) => ({
      ...f,
      starred: starredSet.has(f.id) || !!f.starred,
    }));
    const mappedGoogle = googleFiles.map((f) => ({
      ...f,
      starred: starredSet.has(f.id) || !!f.starred,
    }));
    return [...mappedGoogle, ...mappedLocal];
  }, [googleFiles, localFiles]);

  // Navigation handlers
  const handleNavigateFolder = (folderId: string | null, folderName?: string) => {
    setCurrentFolderId(folderId);
    if (!folderId) {
      setFolderPath([]);
    } else {
      const existingIdx = folderPath.findIndex((f) => f.id === folderId);
      if (existingIdx >= 0) {
        setFolderPath(folderPath.slice(0, existingIdx + 1));
      } else {
        setFolderPath((prev) => [...prev, { id: folderId, name: folderName || 'Folder' }]);
      }
    }
  };

  // File Operations
  const handleToggleStar = async (file: CloudFile) => {
    const nextStarred = !file.starred;
    LocalDbService.toggleStarred(file.id, nextStarred);

    if (file.provider === 'googledrive') {
      try {
        await GoogleDriveService.toggleStar(file.id, nextStarred);
      } catch (err) {
        console.warn('Google Drive star toggle warning:', err);
      }
    }

    // Update local state
    if (file.provider === 'localssd') {
      LocalDbService.updateLocalFile(file.id, { starred: nextStarred });
      setLocalFiles(LocalDbService.getLocalFiles());
    } else {
      setGoogleFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, starred: nextStarred } : f))
      );
    }
  };

  const handleDownloadFile = (file: CloudFile) => {
    transferEngine.enqueueDownload(file.id, file.name, file.sizeBytes, file.provider);
    setCurrentView('transfers');
  };

  const handleStartUpload = (filesToUpload: File[], targetProvider: CloudProviderId) => {
    filesToUpload.forEach((f) => {
      transferEngine.enqueueUpload(f, f.name, targetProvider, currentFolderId || undefined);
    });
    setCurrentView('transfers');
  };

  const handleCreateFolder = async (name: string, targetProvider: CloudProviderId) => {
    setActionError(null);
    try {
      if (targetProvider === 'googledrive') {
        const created = await GoogleDriveService.createFolder(name, currentFolderId);
        setGoogleFiles((prev) => [created, ...prev]);
      } else {
        const newFolder: CloudFile = {
          id: 'ssd-folder-' + Date.now(),
          name,
          provider: 'localssd',
          sizeBytes: 0,
          mimeType: 'application/vnd.google-apps.folder',
          category: 'folder',
          isFolder: true,
          parentId: currentFolderId,
          modifiedTime: new Date().toISOString(),
          createdTime: new Date().toISOString(),
          localCached: true,
        };
        LocalDbService.addLocalFile(newFolder);
        setLocalFiles(LocalDbService.getLocalFiles());
      }
      setIsNewFolderOpen(false);
      setActivities(LocalDbService.getRecentActivities());
    } catch (err: any) {
      setActionError(err.message || 'Failed to create folder');
    }
  };

  const handleRename = async (fileId: string, newName: string, provider: CloudProviderId) => {
    setActionError(null);
    try {
      if (provider === 'googledrive') {
        const updated = await GoogleDriveService.renameFile(fileId, newName);
        setGoogleFiles((prev) => prev.map((f) => (f.id === fileId ? updated : f)));
      } else {
        LocalDbService.updateLocalFile(fileId, { name: newName });
        setLocalFiles(LocalDbService.getLocalFiles());
      }
      setIsRenameOpen(false);
      setRenameTargetFile(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to rename file');
    }
  };

  // Destructive delete confirmation trigger
  const requestDelete = (files: CloudFile[], permanent: boolean = false) => {
    setDeleteTargetFiles(files);
    setIsDeletePermanent(permanent);
    setIsDeleteConfirmOpen(true);
  };

  // Perform confirmed deletion
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setActionError(null);
    try {
      for (const file of deleteTargetFiles) {
        if (file.provider === 'googledrive') {
          if (isDeletePermanent) {
            await GoogleDriveService.deletePermanently(file.id);
            setGoogleFiles((prev) => prev.filter((f) => f.id !== file.id));
          } else {
            await GoogleDriveService.trashFile(file.id);
            setGoogleFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, trashed: true } : f))
            );
          }
        } else {
          LocalDbService.removeLocalFile(file.id, isDeletePermanent);
        }
      }
      setLocalFiles(LocalDbService.getLocalFiles());
      setActivities(LocalDbService.getRecentActivities());
      setIsDeleteConfirmOpen(false);
      setDeleteTargetFiles([]);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete file(s)');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreFile = async (file: CloudFile) => {
    setActionError(null);
    try {
      if (file.provider === 'googledrive') {
        await GoogleDriveService.restoreFile(file.id);
        setGoogleFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, trashed: false } : f))
        );
      } else {
        LocalDbService.restoreLocalFile(file.id);
        setLocalFiles(LocalDbService.getLocalFiles());
      }
      setActivities(LocalDbService.getRecentActivities());
    } catch (err: any) {
      setActionError(err.message || 'Failed to restore file');
    }
  };

  const handleEmptyTrash = () => {
    const trashed = allFiles.filter((f) => f.trashed);
    if (trashed.length > 0) {
      requestDelete(trashed, true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070B14] text-slate-100 overflow-hidden font-sans">
      {/* Windows 11/10 Desktop Title Bar */}
      <TitleBar onOpenSourceExplorer={() => setIsSourceExplorerOpen(true)} />

      {/* Main Desktop Window Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Unified 9-Item Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(v) => {
            setCurrentView(v);
            if (v === 'my_files') setCurrentFolderId(null);
          }}
          activeTransfersCount={transfers.filter((t) => t.status === 'in_progress').length}
          quotas={quotas}
          onOpenSourceExplorer={() => setIsSourceExplorerOpen(true)}
        />

        {/* Content View Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0B101D] overflow-hidden">
          {/* Top Bar */}
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenUploadModal={() => setIsUploadOpen(true)}
            onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
            currentUser={currentUser}
            onSignInWithGoogle={handleSignInGoogle}
            onSignOut={handleSignOutGoogle}
            isLoggingIn={isLoggingIn}
            activities={activities}
            onRefresh={syncGoogleDrive}
            isRefreshing={isRefreshing}
          />

          {/* Action Error Banner if any */}
          {actionError && (
            <div className="bg-red-950/80 border-b border-red-500/40 px-6 py-2 text-xs text-red-300 flex items-center justify-between">
              <span>{actionError}</span>
              <button
                onClick={() => setActionError(null)}
                className="text-red-400 hover:text-white font-semibold text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Views Routing */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {currentView === 'dashboard' && (
              <DashboardView
                quotas={quotas}
                recentFiles={allFiles}
                activities={activities}
                onOpenFilePreview={(file) => {
                  setPreviewFile(file);
                  setIsPreviewOpen(true);
                }}
                onNavigateToFiles={() => setCurrentView('my_files')}
                onNavigateToTransfers={() => setCurrentView('transfers')}
                onNavigateToAccounts={() => setCurrentView('accounts')}
                onOpenSourceExplorer={() => setIsSourceExplorerOpen(true)}
              />
            )}

            {currentView === 'my_files' && (
              <FilesView
                files={allFiles}
                currentFolderId={currentFolderId}
                onNavigateFolder={handleNavigateFolder}
                folderPath={folderPath}
                onOpenFilePreview={(file) => {
                  setPreviewFile(file);
                  setIsPreviewOpen(true);
                }}
                onDownloadFile={handleDownloadFile}
                onToggleStar={handleToggleStar}
                onRenameFile={(file) => {
                  setRenameTargetFile(file);
                  setIsRenameOpen(true);
                }}
                onShareFile={(file) => {
                  setShareTargetFile(file);
                  setIsShareOpen(true);
                }}
                onDeleteFiles={(filesToDelete, permanent) => requestDelete(filesToDelete, permanent)}
                onOpenUploadModal={() => setIsUploadOpen(true)}
                onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
                providerFilter={providerFilter}
                onProviderFilterChange={setProviderFilter}
                searchQuery={searchQuery}
              />
            )}

            {currentView === 'recent' && (
              <RecentFilesView
                files={allFiles}
                onOpenFilePreview={(file) => {
                  setPreviewFile(file);
                  setIsPreviewOpen(true);
                }}
                onDownloadFile={handleDownloadFile}
                onToggleStar={handleToggleStar}
                onShareFile={(file) => {
                  setShareTargetFile(file);
                  setIsShareOpen(true);
                }}
              />
            )}

            {currentView === 'starred' && (
              <StarredView
                files={allFiles}
                onOpenFilePreview={(file) => {
                  setPreviewFile(file);
                  setIsPreviewOpen(true);
                }}
                onDownloadFile={handleDownloadFile}
                onToggleStar={handleToggleStar}
                onShareFile={(file) => {
                  setShareTargetFile(file);
                  setIsShareOpen(true);
                }}
              />
            )}

            {currentView === 'shared' && (
              <SharedView
                files={allFiles}
                onOpenFilePreview={(file) => {
                  setPreviewFile(file);
                  setIsPreviewOpen(true);
                }}
                onDownloadFile={handleDownloadFile}
                onShareFile={(file) => {
                  setShareTargetFile(file);
                  setIsShareOpen(true);
                }}
              />
            )}

            {currentView === 'accounts' && (
              <CloudAccountsView
                quotas={quotas}
                onSignInWithGoogle={handleSignInGoogle}
                onSignOutGoogle={handleSignOutGoogle}
                isLoggingIn={isLoggingIn}
                onRefreshQuotas={syncGoogleDrive}
                isRefreshing={isRefreshing}
              />
            )}

            {currentView === 'transfers' && (
              <TransfersView
                items={transfers}
                onPause={(id) => transferEngine.pauseTransfer(id)}
                onResume={(id) => transferEngine.resumeTransfer(id)}
                onCancel={(id) => transferEngine.cancelTransfer(id)}
                onRetry={(id) => transferEngine.retryTransfer(id)}
                onClearCompleted={() => transferEngine.clearCompleted()}
                onOpenUploadModal={() => setIsUploadOpen(true)}
              />
            )}

            {currentView === 'recycle_bin' && (
              <RecycleBinView
                files={allFiles}
                onRestore={handleRestoreFile}
                onDeletePermanently={(filesToDelete) => requestDelete(filesToDelete, true)}
                onEmptyTrash={handleEmptyTrash}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(updated) => {
                  const saved = LocalDbService.saveSettings(updated);
                  setSettings(saved);
                }}
                onClearCache={() => {
                  LocalDbService.clearLocalCache();
                  setLocalFiles([]);
                  setActivities([]);
                }}
                onSignOutGoogle={handleSignOutGoogle}
                isGoogleDriveConnected={!!currentUser}
                onOpenSourceExplorer={() => setIsSourceExplorerOpen(true)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <ConfirmDeleteModal
        files={deleteTargetFiles}
        isPermanent={isDeletePermanent}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setDeleteTargetFiles([]);
        }}
        isProcessing={isDeleting}
      />

      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={handleCreateFolder}
        defaultProvider={settings.defaultUploadProvider}
        isProcessing={false}
      />

      <RenameModal
        file={renameTargetFile}
        isOpen={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setRenameTargetFile(null);
        }}
        onRename={handleRename}
        isProcessing={false}
      />

      <ShareLinkModal
        file={shareTargetFile}
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setShareTargetFile(null);
        }}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleStartUpload}
        defaultProvider={settings.defaultUploadProvider}
        isGoogleDriveConnected={!!currentUser}
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewFile(null);
        }}
        onDownload={handleDownloadFile}
        onToggleStar={handleToggleStar}
        onShare={(f) => {
          setIsPreviewOpen(false);
          setShareTargetFile(f);
          setIsShareOpen(true);
        }}
        onDelete={(f) => {
          setIsPreviewOpen(false);
          requestDelete([f], false);
        }}
      />

      <CsharpSourceExplorerModal
        isOpen={isSourceExplorerOpen}
        onClose={() => setIsSourceExplorerOpen(false)}
      />
    </div>
  );
}
