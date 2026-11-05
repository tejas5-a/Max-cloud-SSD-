using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MAXCloudSSD.Core.Interfaces;
using MAXCloudSSD.Core.Models;
using MAXCloudSSD.Infrastructure.Security;

namespace MAXCloudSSD.Infrastructure.StorageProviders.GoogleDrive
{
    public class GoogleDriveProvider : ICloudStorageProvider
    {
        private readonly HttpClient _httpClient;
        private readonly DpapiTokenProtector _tokenProtector;
        private string? _cachedAccessToken;

        public string ProviderId => "googledrive";
        public string DisplayName => "Google Drive";
        public bool IsConnected => !string.IsNullOrEmpty(_cachedAccessToken);

        public GoogleDriveProvider(HttpClient httpClient, DpapiTokenProtector tokenProtector)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _tokenProtector = tokenProtector ?? throw new ArgumentNullException(nameof(tokenProtector));
        }

        public async Task<bool> AuthenticateAsync(CancellationToken cancellationToken = default)
        {
            var token = _tokenProtector.Unprotect("GoogleDrive_AccessToken");
            if (!string.IsNullOrEmpty(token))
            {
                _cachedAccessToken = token;
                return true;
            }
            return false;
        }

        public Task DisconnectAsync(CancellationToken cancellationToken = default)
        {
            _tokenProtector.Remove("GoogleDrive_AccessToken");
            _cachedAccessToken = null;
            return Task.CompletedTask;
        }

        public async Task<StorageQuota> GetStorageQuotaAsync(CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            using var request = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/drive/v3/about?fields=storageQuota,user");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            var root = doc.RootElement;

            var quota = root.GetProperty("storageQuota");
            var user = root.GetProperty("user");

            return new StorageQuota
            {
                ProviderId = ProviderId,
                ProviderName = DisplayName,
                IsConnected = true,
                UsageBytes = quota.TryGetProperty("usage", out var u) ? long.Parse(u.GetString() ?? "0") : 0,
                TotalBytes = quota.TryGetProperty("limit", out var l) ? long.Parse(l.GetString() ?? "0") : 15L * 1024 * 1024 * 1024,
                AccountEmail = user.GetProperty("emailAddress").GetString(),
                AccountName = user.GetProperty("displayName").GetString(),
                LastSynced = DateTime.UtcNow
            };
        }

        public async Task<IReadOnlyList<CloudFile>> ListFilesAsync(string? folderId = null, string? searchQuery = null, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            var q = "trashed = false";
            if (!string.IsNullOrEmpty(folderId))
            {
                q += $" and '{folderId}' in parents";
            }
            if (!string.IsNullOrEmpty(searchQuery))
            {
                q += $" and name contains '{searchQuery.Replace("'", "\\\\'")}'";
            }

            var url = $"https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,size,modifiedTime,createdTime,starred,trashed,parents,thumbnailLink,webContentLink,webViewLink,md5Checksum)&q={Uri.EscapeDataString(q)}";
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var list = new List<CloudFile>();
            foreach (var elem in doc.RootElement.GetProperty("files").EnumerateArray())
            {
                var mimeType = elem.GetProperty("mimeType").GetString() ?? "";
                var isFolder = mimeType == "application/vnd.google-apps.folder";
                var size = elem.TryGetProperty("size", out var s) ? long.Parse(s.GetString() ?? "0") : 0;

                list.Add(new CloudFile
                {
                    Id = elem.GetProperty("id").GetString()!,
                    Name = elem.GetProperty("name").GetString()!,
                    ProviderId = ProviderId,
                    SizeBytes = size,
                    MimeType = mimeType,
                    IsFolder = isFolder,
                    ModifiedTime = elem.TryGetProperty("modifiedTime", out var mt) ? DateTime.Parse(mt.GetString()!) : DateTime.UtcNow,
                    CreatedTime = elem.TryGetProperty("createdTime", out var ct) ? DateTime.Parse(ct.GetString()!) : DateTime.UtcNow,
                    Starred = elem.TryGetProperty("starred", out var st) && st.GetBoolean(),
                    ThumbnailUrl = elem.TryGetProperty("thumbnailLink", out var tl) ? tl.GetString() : null,
                    DownloadUrl = elem.TryGetProperty("webContentLink", out var dl) ? dl.GetString() : null,
                    WebViewLink = elem.TryGetProperty("webViewLink", out var wvl) ? wvl.GetString() : null,
                });
            }
            return list;
        }

        public async Task<CloudFile> UploadFileAsync(Stream contentStream, string fileName, string? destinationFolderId, IProgress<TransferProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            var metadata = new Dictionary<string, object> { ["name"] = fileName };
            if (!string.IsNullOrEmpty(destinationFolderId))
            {
                metadata["parents"] = new[] { destinationFolderId };
            }

            var boundary = "---MAXCloudSSDBoundary" + Guid.NewGuid().ToString("N");
            using var content = new MultipartFormDataContent(boundary);
            var metaContent = new StringContent(JsonSerializer.Serialize(metadata), Encoding.UTF8, "application/json");
            content.Add(metaContent, "metadata");

            var streamContent = new StreamContent(contentStream);
            content.Add(streamContent, "file", fileName);

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime")
            {
                Content = content
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            using var respStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(respStream, cancellationToken: cancellationToken);
            var root = doc.RootElement;

            return new CloudFile
            {
                Id = root.GetProperty("id").GetString()!,
                Name = root.GetProperty("name").GetString()!,
                ProviderId = ProviderId,
                MimeType = root.GetProperty("mimeType").GetString()!,
                SizeBytes = root.TryGetProperty("size", out var s) ? long.Parse(s.GetString() ?? "0") : 0,
                ModifiedTime = DateTime.UtcNow,
                CreatedTime = DateTime.UtcNow,
            };
        }

        public async Task DownloadFileAsync(string fileId, Stream destinationStream, IProgress<TransferProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            using var request = new HttpRequestMessage(HttpMethod.Get, $"https://www.googleapis.com/drive/v3/files/{fileId}?alt=media");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            response.EnsureSuccessStatusCode();

            var totalBytes = response.Content.Headers.ContentLength ?? -1L;
            using var sourceStream = await response.Content.ReadAsStreamAsync(cancellationToken);

            var buffer = new byte[81920];
            int bytesRead;
            long totalRead = 0;

            while ((bytesRead = await sourceStream.ReadAsync(buffer, 0, buffer.Length, cancellationToken)) > 0)
            {
                await destinationStream.WriteAsync(buffer, 0, bytesRead, cancellationToken);
                totalRead += bytesRead;
                progress?.Report(new TransferProgress { BytesTransferred = totalRead, TotalBytes = totalBytes });
            }
        }

        public async Task<CloudFile> CreateFolderAsync(string name, string? parentFolderId = null, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            var body = new Dictionary<string, object>
            {
                ["name"] = name,
                ["mimeType"] = "application/vnd.google-apps.folder"
            };
            if (!string.IsNullOrEmpty(parentFolderId))
            {
                body["parents"] = new[] { parentFolderId };
            }

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://www.googleapis.com/drive/v3/files")
            {
                Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            var root = doc.RootElement;

            return new CloudFile
            {
                Id = root.GetProperty("id").GetString()!,
                Name = root.GetProperty("name").GetString()!,
                ProviderId = ProviderId,
                MimeType = "application/vnd.google-apps.folder",
                IsFolder = true,
                ModifiedTime = DateTime.UtcNow,
                CreatedTime = DateTime.UtcNow
            };
        }

        public async Task<CloudFile> RenameFileAsync(string fileId, string newName, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            using var request = new HttpRequestMessage(HttpMethod.Patch, $"https://www.googleapis.com/drive/v3/files/{fileId}")
            {
                Content = new StringContent(JsonSerializer.Serialize(new { name = newName }), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
            return await GetFileMetadataAsync(fileId, cancellationToken);
        }

        public async Task<CloudFile> MoveFileAsync(string fileId, string newFolderId, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            using var request = new HttpRequestMessage(HttpMethod.Patch, $"https://www.googleapis.com/drive/v3/files/{fileId}?addParents={newFolderId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
            return await GetFileMetadataAsync(fileId, cancellationToken);
        }

        public async Task DeleteFileAsync(string fileId, bool permanent = false, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            if (permanent)
            {
                using var request = new HttpRequestMessage(HttpMethod.Delete, $"https://www.googleapis.com/drive/v3/files/{fileId}");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);
                using var response = await _httpClient.SendAsync(request, cancellationToken);
                response.EnsureSuccessStatusCode();
            }
            else
            {
                using var request = new HttpRequestMessage(HttpMethod.Patch, $"https://www.googleapis.com/drive/v3/files/{fileId}")
                {
                    Content = new StringContent(JsonSerializer.Serialize(new { trashed = true }), Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);
                using var response = await _httpClient.SendAsync(request, cancellationToken);
                response.EnsureSuccessStatusCode();
            }
        }

        public async Task RestoreFileAsync(string fileId, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            using var request = new HttpRequestMessage(HttpMethod.Patch, $"https://www.googleapis.com/drive/v3/files/{fileId}")
            {
                Content = new StringContent(JsonSerializer.Serialize(new { trashed = false }), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);
            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
        }

        public async Task<AccountInfo> GetAccountInfoAsync(CancellationToken cancellationToken = default)
        {
            var quota = await GetStorageQuotaAsync(cancellationToken);
            return new AccountInfo("gdrive_user", quota.AccountName ?? "Google User", quota.AccountEmail ?? "user@gmail.com", null);
        }

        public async Task<CloudFile> GetFileMetadataAsync(string fileId, CancellationToken cancellationToken = default)
        {
            EnsureAuthenticated();
            using var request = new HttpRequestMessage(HttpMethod.Get, $"https://www.googleapis.com/drive/v3/files/{fileId}?fields=id,name,mimeType,size,modifiedTime,createdTime,starred,trashed,parents,thumbnailLink,webContentLink,webViewLink");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cachedAccessToken);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            var root = doc.RootElement;

            return new CloudFile
            {
                Id = root.GetProperty("id").GetString()!,
                Name = root.GetProperty("name").GetString()!,
                ProviderId = ProviderId,
                MimeType = root.GetProperty("mimeType").GetString()!,
                SizeBytes = root.TryGetProperty("size", out var s) ? long.Parse(s.GetString() ?? "0") : 0,
                ModifiedTime = DateTime.UtcNow,
                CreatedTime = DateTime.UtcNow
            };
        }

        private void EnsureAuthenticated()
        {
            if (string.IsNullOrEmpty(_cachedAccessToken))
            {
                throw new InvalidOperationException("Google Drive is not authenticated.");
            }
        }
    }
}
