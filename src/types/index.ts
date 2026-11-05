export type CloudProviderId = 'googledrive' | 'terabox' | 'localssd';

export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'document'
  | 'archive'
  | 'executable'
  | 'other'
  | 'folder';

export interface CloudFile {
  id: string;
  name: string;
  provider: CloudProviderId;
  sizeBytes: number;
  mimeType: string;
  category: FileCategory;
  isFolder: boolean;
  parentId?: string | null;
  modifiedTime: string;
  createdTime?: string;
  starred?: boolean;
  trashed?: boolean;
  thumbnailUrl?: string;
  downloadUrl?: string;
  webViewLink?: string;
  shared?: boolean;
  sharePermission?: 'reader' | 'commenter' | 'writer';
  md5Checksum?: string;
  localCached?: boolean;
}

export interface StorageQuota {
  provider: CloudProviderId;
  providerName: string;
  connected: boolean;
  usageBytes: number;
  totalBytes: number;
  trashBytes?: number;
  accountEmail?: string;
  accountName?: string;
  accountAvatar?: string;
  lastSynced?: string;
}

export type TransferStatus = 'queued' | 'in_progress' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface TransferItem {
  id: string;
  name: string;
  type: 'upload' | 'download';
  provider: CloudProviderId;
  sizeBytes: number;
  transferredBytes: number;
  progressPercent: number;
  speedBps: number;
  status: TransferStatus;
  startTime: number;
  endTime?: number;
  error?: string;
  destinationPath?: string;
  fileBlob?: Blob | File;
  targetFolderId?: string;
  canPauseResume: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: 'upload' | 'download' | 'delete' | 'restore' | 'rename' | 'create_folder' | 'share' | 'connect';
  fileName: string;
  provider: CloudProviderId;
  details?: string;
  status: 'success' | 'warning' | 'error';
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'midnight';
  accentColor: 'orange' | 'blue' | 'emerald' | 'violet';
  enableAnimations: boolean;
  defaultUploadProvider: CloudProviderId;
  defaultDownloadPath: string;
  maxConcurrentTransfers: number;
  autoRetryTransfers: boolean;
  transferSpeedLimitMbps: number; // 0 = unlimited
  enableDesktopNotifications: boolean;
  sqliteCacheEnabled: boolean;
  offlineMetadataCache: boolean;
}
