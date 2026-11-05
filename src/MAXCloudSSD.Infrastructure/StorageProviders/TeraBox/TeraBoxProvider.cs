using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MAXCloudSSD.Core.Interfaces;
using MAXCloudSSD.Core.Models;

namespace MAXCloudSSD.Infrastructure.StorageProviders.TeraBox
{
    public class TeraBoxProvider : ICloudStorageProvider
    {
        public const string UnsupportedMessage = "TeraBox integration is not currently supported. Connect it when an authorized API becomes available.";

        public string ProviderId => "terabox";
        public string DisplayName => "TeraBox";
        public bool IsConnected => false;

        public Task<bool> AuthenticateAsync(CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task DisconnectAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<AccountInfo> GetAccountInfoAsync(CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task<StorageQuota> GetStorageQuotaAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new StorageQuota
            {
                ProviderId = ProviderId,
                ProviderName = DisplayName,
                IsConnected = false,
                UsageBytes = 0,
                TotalBytes = 1024L * 1024 * 1024 * 1024,
                LastSynced = null
            });
        }

        public Task<IReadOnlyList<CloudFile>> ListFilesAsync(string? folderId = null, string? searchQuery = null, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task<CloudFile> UploadFileAsync(Stream contentStream, string fileName, string? destinationFolderId, IProgress<TransferProgress>? progress = null, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task DownloadFileAsync(string fileId, Stream destinationStream, IProgress<TransferProgress>? progress = null, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task<CloudFile> CreateFolderAsync(string name, string? parentFolderId = null, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task<CloudFile> RenameFileAsync(string fileId, string newName, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task<CloudFile> MoveFileAsync(string fileId, string newFolderId, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task DeleteFileAsync(string fileId, bool permanent = false, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task RestoreFileAsync(string fileId, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
        public Task<CloudFile> GetFileMetadataAsync(string fileId, CancellationToken cancellationToken = default) => throw new NotSupportedException(UnsupportedMessage);
    }
}
