import type { ActivityLog, AppSettings, CloudFile, StorageQuota } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'maxcloud_settings_v1',
  LOCAL_FILES: 'maxcloud_local_files_v1',
  STARRED_IDS: 'maxcloud_starred_ids_v1',
  RECENT_FILES: 'maxcloud_recent_files_v1',
  ACTIVITIES: 'maxcloud_activities_v1',
  CACHED_QUOTA: 'maxcloud_cached_quota_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'orange',
  enableAnimations: true,
  defaultUploadProvider: 'googledrive',
  defaultDownloadPath: 'C:\\Users\\User\\Downloads\\MAXCloudSSD',
  maxConcurrentTransfers: 3,
  autoRetryTransfers: true,
  transferSpeedLimitMbps: 0,
  enableDesktopNotifications: true,
  sqliteCacheEnabled: true,
  offlineMetadataCache: true,
};

const SEED_LOCAL_FILES: CloudFile[] = [
  {
    id: 'ssd-file-1',
    name: 'SSD_Architecture_Whitepaper_v2.pdf',
    provider: 'localssd',
    sizeBytes: 4892400, // ~4.8 MB
    mimeType: 'application/pdf',
    category: 'pdf',
    isFolder: false,
    modifiedTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    starred: true,
    trashed: false,
    localCached: true,
  },
  {
    id: 'ssd-folder-1',
    name: 'Firmware & Drivers',
    provider: 'localssd',
    sizeBytes: 0,
    mimeType: 'application/vnd.google-apps.folder',
    category: 'folder',
    isFolder: true,
    modifiedTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    starred: false,
    trashed: false,
    localCached: true,
  },
  {
    id: 'ssd-file-2',
    name: 'MAXCloudSSD_Setup_x86_v2.4.exe',
    provider: 'localssd',
    sizeBytes: 28450120, // ~28.4 MB
    mimeType: 'application/x-msdownload',
    category: 'executable',
    isFolder: false,
    parentId: 'ssd-folder-1',
    modifiedTime: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdTime: new Date(Date.now() - 3600000 * 16).toISOString(),
    starred: true,
    trashed: false,
    localCached: true,
  },
  {
    id: 'ssd-file-3',
    name: 'HighSpeed_IO_Benchmark_Results.xlsx',
    provider: 'localssd',
    sizeBytes: 1542000, // ~1.5 MB
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'document',
    isFolder: false,
    modifiedTime: new Date(Date.now() - 3600000 * 20).toISOString(),
    createdTime: new Date(Date.now() - 3600000 * 30).toISOString(),
    starred: false,
    trashed: false,
    localCached: true,
  },
  {
    id: 'ssd-file-4',
    name: 'Drive_Telemetry_Dump_2026.zip',
    provider: 'localssd',
    sizeBytes: 84320000, // ~84 MB
    mimeType: 'application/zip',
    category: 'archive',
    isFolder: false,
    modifiedTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    createdTime: new Date(Date.now() - 3600000 * 96).toISOString(),
    starred: false,
    trashed: false,
    localCached: true,
  },
  {
    id: 'ssd-file-5',
    name: 'SSD_Dashboard_Preview.png',
    provider: 'localssd',
    sizeBytes: 3120000,
    mimeType: 'image/png',
    category: 'image',
    isFolder: false,
    modifiedTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    starred: true,
    trashed: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80',
    localCached: true,
  },
];

export class LocalDbService {
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Failed to load settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
    return updated;
  }

  static getLocalFiles(): CloudFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCAL_FILES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load local files', e);
    }
    // initialize with seed
    this.saveLocalFiles(SEED_LOCAL_FILES);
    return SEED_LOCAL_FILES;
  }

  static saveLocalFiles(files: CloudFile[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCAL_FILES, JSON.stringify(files));
    } catch (e) {
      console.warn('Failed to save local files', e);
    }
  }

  static addLocalFile(file: CloudFile) {
    const files = this.getLocalFiles();
    const existingIndex = files.findIndex((f) => f.id === file.id);
    if (existingIndex >= 0) {
      files[existingIndex] = file;
    } else {
      files.unshift(file);
    }
    this.saveLocalFiles(files);
    this.logActivity({
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: file.isFolder ? 'create_folder' : 'upload',
      fileName: file.name,
      provider: file.provider,
      status: 'success',
      details: `${file.isFolder ? 'Created folder' : 'Uploaded file'} (${(file.sizeBytes / 1024 / 1024).toFixed(1)} MB)`,
    });
  }

  static updateLocalFile(id: string, updates: Partial<CloudFile>): CloudFile | null {
    const files = this.getLocalFiles();
    const idx = files.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    files[idx] = { ...files[idx], ...updates };
    this.saveLocalFiles(files);
    return files[idx];
  }

  static removeLocalFile(id: string, permanent: boolean = false) {
    let files = this.getLocalFiles();
    const target = files.find((f) => f.id === id);
    if (!target) return;

    if (permanent || target.trashed) {
      files = files.filter((f) => f.id !== id);
      this.logActivity({
        id: 'act-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'delete',
        fileName: target.name,
        provider: target.provider,
        status: 'warning',
        details: 'Permanently deleted',
      });
    } else {
      target.trashed = true;
      this.logActivity({
        id: 'act-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'delete',
        fileName: target.name,
        provider: target.provider,
        status: 'warning',
        details: 'Moved to Recycle Bin',
      });
    }
    this.saveLocalFiles(files);
  }

  static restoreLocalFile(id: string) {
    const files = this.getLocalFiles();
    const target = files.find((f) => f.id === id);
    if (target) {
      target.trashed = false;
      this.saveLocalFiles(files);
      this.logActivity({
        id: 'act-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'restore',
        fileName: target.name,
        provider: target.provider,
        status: 'success',
        details: 'Restored from Recycle Bin',
      });
    }
  }

  static getStarredIds(): Set<string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STARRED_IDS);
      if (data) return new Set(JSON.parse(data));
    } catch (e) {
      console.warn(e);
    }
    return new Set(['ssd-file-1', 'ssd-file-2', 'ssd-file-5']);
  }

  static toggleStarred(id: string, starred: boolean) {
    const set = this.getStarredIds();
    if (starred) set.add(id);
    else set.delete(id);
    try {
      localStorage.setItem(STORAGE_KEYS.STARRED_IDS, JSON.stringify(Array.from(set)));
    } catch (e) {
      console.warn(e);
    }
  }

  static getRecentActivities(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'act-init-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        action: 'connect',
        fileName: 'MAX CLOUD SSD Storage Engine',
        provider: 'localssd',
        status: 'success',
        details: 'High-speed local NVMe metadata cache mounted (32-bit Win32 optimized)',
      },
      {
        id: 'act-init-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        action: 'upload',
        fileName: 'SSD_Architecture_Whitepaper_v2.pdf',
        provider: 'localssd',
        status: 'success',
        details: 'Synchronized with local storage cache (4.8 MB)',
      },
      {
        id: 'act-init-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        action: 'download',
        fileName: 'MAXCloudSSD_Setup_x86_v2.4.exe',
        provider: 'localssd',
        status: 'success',
        details: 'Verified SHA-256 integrity check and Win32 PE signature',
      },
    ];
  }

  static logActivity(entry: ActivityLog) {
    const list = this.getRecentActivities();
    list.unshift(entry);
    if (list.length > 50) list.pop();
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  }

  static getLocalSsdQuota(): StorageQuota {
    const files = this.getLocalFiles().filter((f) => !f.trashed);
    const usageBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0) + 18450000000; // base simulated NVMe cache partition
    const totalBytes = 128 * 1024 * 1024 * 1024; // 128 GB Local SSD allocated partition

    return {
      provider: 'localssd',
      providerName: 'MAX Local SSD Cache',
      connected: true,
      usageBytes,
      totalBytes,
      accountName: 'Host Machine (Win32 x86)',
      accountEmail: 'local-nvme@maxcloudssd.internal',
      lastSynced: new Date().toISOString(),
    };
  }

  static clearLocalCache() {
    localStorage.removeItem(STORAGE_KEYS.LOCAL_FILES);
    localStorage.removeItem(STORAGE_KEYS.STARRED_IDS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  }
}
