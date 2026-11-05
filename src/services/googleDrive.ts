import { getAccessToken } from './firebase';
import type { CloudFile, FileCategory, StorageQuota } from '../types';

export function getFileCategory(mimeType: string, fileName: string): FileCategory {
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';

  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.zip') || lowerName.endsWith('.rar') || lowerName.endsWith('.7z') || lowerName.endsWith('.tar') || lowerName.endsWith('.gz')) {
    return 'archive';
  }
  if (lowerName.endsWith('.exe') || lowerName.endsWith('.msi') || lowerName.endsWith('.bat') || lowerName.endsWith('.cmd')) {
    return 'executable';
  }
  if (
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType.includes('text') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation') ||
    mimeType.startsWith('application/vnd.google-apps.') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.pptx') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md')
  ) {
    return 'document';
  }
  return 'other';
}

function mapDriveFileToCloudFile(file: any): CloudFile {
  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
  const sizeBytes = file.size ? parseInt(file.size, 10) : 0;
  const category = getFileCategory(file.mimeType, file.name);

  return {
    id: file.id,
    name: file.name,
    provider: 'googledrive',
    sizeBytes,
    mimeType: file.mimeType,
    category,
    isFolder,
    parentId: file.parents && file.parents.length > 0 ? file.parents[0] : null,
    modifiedTime: file.modifiedTime || new Date().toISOString(),
    createdTime: file.createdTime,
    starred: !!file.starred,
    trashed: !!file.trashed,
    thumbnailUrl: file.thumbnailLink,
    downloadUrl: file.webContentLink,
    webViewLink: file.webViewLink,
    shared: !!file.shared,
    md5Checksum: file.md5Checksum,
    localCached: false,
  };
}

export class GoogleDriveService {
  private static async getHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Google Drive access token is not available. Please sign in with Google.');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getStorageQuota(): Promise<StorageQuota> {
    const headers = await this.getHeaders();
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=storageQuota,user',
      { headers }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch storage quota (${res.status})`);
    }

    const data = await res.json();
    const quota = data.storageQuota || {};
    const user = data.user || {};

    const usageBytes = quota.usage ? parseInt(quota.usage, 10) : 0;
    const totalBytes = quota.limit ? parseInt(quota.limit, 10) : 15 * 1024 * 1024 * 1024; // default 15GB free tier
    const trashBytes = quota.usageInDriveTrash ? parseInt(quota.usageInDriveTrash, 10) : 0;

    return {
      provider: 'googledrive',
      providerName: 'Google Drive',
      connected: true,
      usageBytes,
      totalBytes,
      trashBytes,
      accountEmail: user.emailAddress,
      accountName: user.displayName,
      accountAvatar: user.photoLink,
      lastSynced: new Date().toISOString(),
    };
  }

  static async listFiles(options: {
    folderId?: string | null;
    searchQuery?: string;
    trashed?: boolean;
    onlyStarred?: boolean;
    category?: FileCategory | 'all';
  }): Promise<CloudFile[]> {
    const headers = await this.getHeaders();
    const queryParts: string[] = [];

    if (options.trashed) {
      queryParts.push('trashed = true');
    } else {
      queryParts.push('trashed = false');
      if (options.folderId) {
        queryParts.push(`'${options.folderId}' in parents`);
      }
    }

    if (options.onlyStarred) {
      queryParts.push('starred = true');
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const sanitized = options.searchQuery.replace(/'/g, "\\'");
      queryParts.push(`name contains '${sanitized}'`);
    }

    const q = queryParts.join(' and ');
    const fields = 'nextPageToken,files(id,name,mimeType,size,modifiedTime,createdTime,starred,trashed,parents,thumbnailLink,webContentLink,webViewLink,shared,md5Checksum)';
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=100&fields=${encodeURIComponent(
      fields
    )}&orderBy=folder desc,name asc&q=${encodeURIComponent(q)}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to list files (${res.status})`);
    }

    const data = await res.json();
    let files = (data.files || []).map(mapDriveFileToCloudFile);

    if (options.category && options.category !== 'all') {
      files = files.filter((f: CloudFile) => f.category === options.category);
    }

    return files;
  }

  static async createFolder(name: string, parentFolderId?: string | null): Promise<CloudFile> {
    const headers = await this.getHeaders();
    const body: Record<string, any> = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
      body.parents = [parentFolderId];
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create folder (${res.status})`);
    }

    const data = await res.json();
    return mapDriveFileToCloudFile(data);
  }

  static async renameFile(fileId: string, newName: string): Promise<CloudFile> {
    const headers = await this.getHeaders();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: newName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to rename file (${res.status})`);
    }

    const data = await res.json();
    return mapDriveFileToCloudFile(data);
  }

  static async moveFile(fileId: string, newParentId: string, oldParentId?: string): Promise<CloudFile> {
    const headers = await this.getHeaders();
    let url = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${newParentId}`;
    if (oldParentId) {
      url += `&removeParents=${oldParentId}`;
    }

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to move file (${res.status})`);
    }

    const data = await res.json();
    return mapDriveFileToCloudFile(data);
  }

  static async toggleStar(fileId: string, starred: boolean): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ starred }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to star file (${res.status})`);
    }
  }

  static async trashFile(fileId: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ trashed: true }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to move file to trash (${res.status})`);
    }
  }

  static async restoreFile(fileId: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ trashed: false }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to restore file (${res.status})`);
    }
  }

  static async deletePermanently(fileId: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: headers.Authorization,
      },
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to delete file permanently (${res.status})`);
    }
  }

  static async createShareLink(fileId: string, role: 'reader' | 'commenter' | 'writer' = 'reader'): Promise<string> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated');

    // Make file accessible to anyone with link
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        type: 'anyone',
      }),
    });

    // Retrieve the webViewLink
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
  }

  static async uploadFile(
    file: File | Blob,
    fileName: string,
    parentFolderId?: string | null,
    onProgress?: (percent: number, transferred: number, total: number) => void
  ): Promise<CloudFile> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    // Simple / multipart upload for browser fetch
    const metadata: Record<string, any> = {
      name: fileName,
      mimeType: (file as File).type || 'application/octet-stream',
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open(
        'POST',
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,createdTime,starred,trashed,parents,thumbnailLink,webContentLink,webViewLink'
      );
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent, e.loaded, e.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(mapDriveFileToCloudFile(data));
          } catch (e) {
            reject(new Error('Invalid response from Google Drive'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  }

  static async downloadFile(fileId: string, fileName: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to download file (${res.status})`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
