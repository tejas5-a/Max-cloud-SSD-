import type { CloudProviderId, TransferItem, TransferStatus } from '../types';
import { GoogleDriveService } from './googleDrive';
import { LocalDbService } from './localDb';

type TransferListener = (items: TransferItem[]) => void;

class TransferEngineService {
  private items: TransferItem[] = [];
  private listeners: Set<TransferListener> = new Set();
  private maxConcurrent = 3;
  private activeCount = 0;
  private timer: any = null;

  constructor() {
    this.startTicker();
  }

  subscribe(listener: TransferListener): () => void {
    this.listeners.add(listener);
    listener([...this.items]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const copy = [...this.items];
    this.listeners.forEach((fn) => fn(copy));
  }

  getItems(): TransferItem[] {
    return [...this.items];
  }

  enqueueUpload(
    file: File | Blob,
    fileName: string,
    provider: CloudProviderId,
    targetFolderId?: string
  ): TransferItem {
    const item: TransferItem = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: fileName,
      type: 'upload',
      provider,
      sizeBytes: file.size,
      transferredBytes: 0,
      progressPercent: 0,
      speedBps: 0,
      status: 'queued',
      startTime: Date.now(),
      fileBlob: file,
      targetFolderId,
      canPauseResume: provider === 'googledrive' || provider === 'localssd',
    };

    this.items.unshift(item);
    this.notify();
    this.processQueue();
    return item;
  }

  enqueueDownload(
    fileId: string,
    fileName: string,
    sizeBytes: number,
    provider: CloudProviderId
  ): TransferItem {
    const item: TransferItem = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: fileName,
      type: 'download',
      provider,
      sizeBytes,
      transferredBytes: 0,
      progressPercent: 0,
      speedBps: 0,
      status: 'queued',
      startTime: Date.now(),
      targetFolderId: fileId,
      canPauseResume: true,
    };

    this.items.unshift(item);
    this.notify();
    this.processQueue();
    return item;
  }

  pauseTransfer(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (item && item.status === 'in_progress') {
      item.status = 'paused';
      item.speedBps = 0;
      this.activeCount = Math.max(0, this.activeCount - 1);
      this.notify();
      this.processQueue();
    }
  }

  resumeTransfer(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (item && (item.status === 'paused' || item.status === 'failed')) {
      item.status = 'queued';
      this.notify();
      this.processQueue();
    }
  }

  cancelTransfer(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      if (item.status === 'in_progress') {
        this.activeCount = Math.max(0, this.activeCount - 1);
      }
      item.status = 'cancelled';
      item.speedBps = 0;
      this.notify();
      this.processQueue();
    }
  }

  retryTransfer(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = 'queued';
      item.transferredBytes = 0;
      item.progressPercent = 0;
      item.error = undefined;
      item.startTime = Date.now();
      this.notify();
      this.processQueue();
    }
  }

  clearCompleted() {
    this.items = this.items.filter((i) => i.status !== 'completed' && i.status !== 'cancelled');
    this.notify();
  }

  private processQueue() {
    const settings = LocalDbService.getSettings();
    this.maxConcurrent = settings.maxConcurrentTransfers || 3;

    while (this.activeCount < this.maxConcurrent) {
      const next = this.items.find((i) => i.status === 'queued');
      if (!next) break;
      this.startItem(next);
    }
  }

  private async startItem(item: TransferItem) {
    item.status = 'in_progress';
    this.activeCount++;
    this.notify();

    if (item.type === 'upload' && item.provider === 'googledrive' && item.fileBlob) {
      try {
        await GoogleDriveService.uploadFile(
          item.fileBlob,
          item.name,
          item.targetFolderId,
          (percent, transferred) => {
            if (item.status === 'in_progress') {
              item.progressPercent = percent;
              item.transferredBytes = transferred;
              const elapsedSec = (Date.now() - item.startTime) / 1000;
              item.speedBps = elapsedSec > 0 ? transferred / elapsedSec : 0;
              this.notify();
            }
          }
        );
        item.status = 'completed';
        item.progressPercent = 100;
        item.transferredBytes = item.sizeBytes;
        item.endTime = Date.now();
      } catch (err: any) {
        item.status = 'failed';
        item.error = err.message || 'Upload failed';
      } finally {
        this.activeCount = Math.max(0, this.activeCount - 1);
        this.notify();
        this.processQueue();
      }
    } else if (item.type === 'download' && item.provider === 'googledrive' && item.targetFolderId) {
      try {
        await GoogleDriveService.downloadFile(item.targetFolderId, item.name);
        item.status = 'completed';
        item.progressPercent = 100;
        item.transferredBytes = item.sizeBytes;
        item.endTime = Date.now();
      } catch (err: any) {
        item.status = 'failed';
        item.error = err.message || 'Download failed';
      } finally {
        this.activeCount = Math.max(0, this.activeCount - 1);
        this.notify();
        this.processQueue();
      }
    } else {
      // High-speed simulated streaming for Local SSD or preview mode
      this.simulateStreamingTransfer(item);
    }
  }

  private simulateStreamingTransfer(item: TransferItem) {
    const totalBytes = item.sizeBytes || 1024 * 1024 * 5;
    const chunkSize = Math.max(64 * 1024, Math.floor(totalBytes / 40)); // chunked
    let currentBytes = item.transferredBytes;

    const interval = setInterval(() => {
      if (item.status !== 'in_progress') {
        clearInterval(interval);
        return;
      }

      currentBytes += chunkSize;
      if (currentBytes >= totalBytes) {
        currentBytes = totalBytes;
        item.transferredBytes = totalBytes;
        item.progressPercent = 100;
        item.status = 'completed';
        item.endTime = Date.now();
        item.speedBps = 0;
        this.activeCount = Math.max(0, this.activeCount - 1);
        clearInterval(interval);

        // If local SSD upload, register file in localDb
        if (item.type === 'upload' && item.provider === 'localssd') {
          LocalDbService.addLocalFile({
            id: 'ssd-' + Date.now(),
            name: item.name,
            provider: 'localssd',
            sizeBytes: totalBytes,
            mimeType: 'application/octet-stream',
            category: 'other',
            isFolder: false,
            modifiedTime: new Date().toISOString(),
            createdTime: new Date().toISOString(),
            localCached: true,
          });
        }

        this.notify();
        this.processQueue();
      } else {
        item.transferredBytes = currentBytes;
        item.progressPercent = Math.round((currentBytes / totalBytes) * 100);
        // calculate speed ~ 12 - 45 MB/s
        item.speedBps = 15 * 1024 * 1024 + Math.random() * 20 * 1024 * 1024;
        this.notify();
      }
    }, 150);
  }

  private startTicker() {
    this.timer = setInterval(() => {
      // keeps UI fresh
    }, 1000);
  }
}

export const transferEngine = new TransferEngineService();
