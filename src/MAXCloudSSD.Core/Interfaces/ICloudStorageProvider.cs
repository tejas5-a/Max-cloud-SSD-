using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MAXCloudSSD.Core.Models;

namespace MAXCloudSSD.Core.Interfaces
{
    public interface ICloudStorageProvider
    {
        string ProviderId { get; }
        string DisplayName { get; }
        bool IsConnected { get; }

        Task<bool> AuthenticateAsync(CancellationToken cancellationToken = default);
        Task DisconnectAsync(CancellationToken cancellationToken = default);
        Task<AccountInfo> GetAccountInfoAsync(CancellationToken cancellationToken = default);
        Task<StorageQuota> GetStorageQuotaAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<CloudFile>> ListFilesAsync(string? folderId = null, string? searchQuery = null, CancellationToken cancellationToken = default);
        Task<CloudFile> UploadFileAsync(Stream contentStream, string fileName, string? destinationFolderId, IProgress<TransferProgress>? progress = null, CancellationToken cancellationToken = default);
        Task DownloadFileAsync(string fileId, Stream destinationStream, IProgress<TransferProgress>? progress = null, CancellationToken cancellationToken = default);
        Task<CloudFile> CreateFolderAsync(string name, string? parentFolderId = null, CancellationToken cancellationToken = default);
        Task<CloudFile> RenameFileAsync(string fileId, string newName, CancellationToken cancellationToken = default);
        Task<CloudFile> MoveFileAsync(string fileId, string newFolderId, CancellationToken cancellationToken = default);
        Task DeleteFileAsync(string fileId, bool permanent = false, CancellationToken cancellationToken = default);
        Task RestoreFileAsync(string fileId, CancellationToken cancellationToken = default);
        Task<CloudFile> GetFileMetadataAsync(string fileId, CancellationToken cancellationToken = default);
    }
}
