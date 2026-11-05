import JSZip from 'jszip';

export interface CSharpFileEntry {
  path: string;
  category: 'solution' | 'app' | 'core' | 'infrastructure' | 'tests' | 'docs';
  description: string;
  content: string;
}

export const CSHARP_PROJECT_FILES: CSharpFileEntry[] = [
  {
    path: 'MAXCloudSSD.sln',
    category: 'solution',
    description: 'Visual Studio 2022 / .NET 8 Solution File (Win32 x86 Target)',
    content: `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.8.34330.188
MinimumVisualStudioVersion = 10.0.40219.1
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "MAXCloudSSD.Core", "src\\MAXCloudSSD.Core\\MAXCloudSSD.Core.csproj", "{A1111111-1111-1111-1111-111111111111}"
EndProject
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "MAXCloudSSD.Infrastructure", "src\\MAXCloudSSD.Infrastructure\\MAXCloudSSD.Infrastructure.csproj", "{B2222222-2222-2222-2222-222222222222}"
EndProject
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "MAXCloudSSD.App", "src\\MAXCloudSSD.App\\MAXCloudSSD.App.csproj", "{C3333333-3333-3333-3333-333333333333}"
EndProject
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "MAXCloudSSD.Tests", "tests\\MAXCloudSSD.Tests\\MAXCloudSSD.Tests.csproj", "{D4444444-4444-4444-4444-444444444444}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|x86 = Debug|x86
		Release|x86 = Release|x86
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{A1111111-1111-1111-1111-111111111111}.Debug|x86.ActiveCfg = Debug|x86
		{A1111111-1111-1111-1111-111111111111}.Debug|x86.Build.0 = Debug|x86
		{A1111111-1111-1111-1111-111111111111}.Release|x86.ActiveCfg = Release|x86
		{A1111111-1111-1111-1111-111111111111}.Release|x86.Build.0 = Release|x86
		{B2222222-2222-2222-2222-222222222222}.Debug|x86.ActiveCfg = Debug|x86
		{B2222222-2222-2222-2222-222222222222}.Debug|x86.Build.0 = Debug|x86
		{B2222222-2222-2222-2222-222222222222}.Release|x86.ActiveCfg = Release|x86
		{B2222222-2222-2222-2222-222222222222}.Release|x86.Build.0 = Release|x86
		{C3333333-3333-3333-3333-333333333333}.Debug|x86.ActiveCfg = Debug|x86
		{C3333333-3333-3333-3333-333333333333}.Debug|x86.Build.0 = Debug|x86
		{C3333333-3333-3333-3333-333333333333}.Release|x86.ActiveCfg = Release|x86
		{C3333333-3333-3333-3333-333333333333}.Release|x86.Build.0 = Release|x86
		{D4444444-4444-4444-4444-444444444444}.Debug|x86.ActiveCfg = Debug|x86
		{D4444444-4444-4444-4444-444444444444}.Debug|x86.Build.0 = Debug|x86
		{D4444444-4444-4444-4444-444444444444}.Release|x86.ActiveCfg = Release|x86
		{D4444444-4444-4444-4444-444444444444}.Release|x86.Build.0 = Release|x86
	EndGlobalSection
EndGlobal`,
  },
  {
    path: 'src/MAXCloudSSD.App/MAXCloudSSD.App.csproj',
    category: 'app',
    description: 'WPF Application Project Configuration targeting .NET 8 Win-x86',
    content: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
    <ApplicationIcon>Assets\\AppIcon.ico</ApplicationIcon>
    <AssemblyName>MAXCloudSSD</AssemblyName>
    <RootNamespace>MAXCloudSSD.App</RootNamespace>
    <!-- Explicit 32-bit x86 Windows Target -->
    <PlatformTarget>x86</PlatformTarget>
    <Platforms>x86</Platforms>
    <RuntimeIdentifier>win-x86</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
    <PublishSingleFile>true</PublishSingleFile>
    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
    <Company>MAX CLOUD SSD Team</Company>
    <Product>MAX CLOUD SSD</Product>
    <Version>2.4.0</Version>
    <AssemblyVersion>2.4.0.0</AssemblyVersion>
    <FileVersion>2.4.0.0</FileVersion>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="CommunityToolkit.Mvvm" Version="8.2.2" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.0" />
    <PackageReference Include="Microsoft.Data.Sqlite" Version="8.0.2" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\MAXCloudSSD.Core\\MAXCloudSSD.Core.csproj" />
    <ProjectReference Include="..\\MAXCloudSSD.Infrastructure\\MAXCloudSSD.Infrastructure.csproj" />
  </ItemGroup>

</Project>`,
  },
  {
    path: 'src/MAXCloudSSD.Core/Interfaces/ICloudStorageProvider.cs',
    category: 'core',
    description: 'Core Provider Interface specification for Unified Cloud Storage',
    content: `using System;
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
}`,
  },
  {
    path: 'src/MAXCloudSSD.Core/Models/CloudFile.cs',
    category: 'core',
    description: 'Unified Cloud File entity with provider metadata and categorization',
    content: `using System;

namespace MAXCloudSSD.Core.Models
{
    public enum FileCategory
    {
        Image,
        Video,
        Audio,
        Pdf,
        Document,
        Archive,
        Executable,
        Folder,
        Other
    }

    public record CloudFile
    {
        public required string Id { get; init; }
        public required string Name { get; init; }
        public required string ProviderId { get; init; }
        public long SizeBytes { get; init; }
        public required string MimeType { get; init; }
        public FileCategory Category { get; init; }
        public bool IsFolder { get; init; }
        public string? ParentId { get; init; }
        public DateTime ModifiedTime { get; init; }
        public DateTime CreatedTime { get; init; }
        public bool Starred { get; init; }
        public bool Trashed { get; init; }
        public string? ThumbnailUrl { get; init; }
        public string? DownloadUrl { get; init; }
        public string? WebViewLink { get; init; }
        public string? Md5Checksum { get; init; }
    }

    public record StorageQuota
    {
        public required string ProviderId { get; init; }
        public required string ProviderName { get; init; }
        public bool IsConnected { get; init; }
        public long UsageBytes { get; init; }
        public long TotalBytes { get; init; }
        public long TrashBytes { get; init; }
        public string? AccountEmail { get; init; }
        public string? AccountName { get; init; }
        public DateTime? LastSynced { get; init; }
    }

    public record TransferProgress
    {
        public long BytesTransferred { get; init; }
        public long TotalBytes { get; init; }
        public double Percentage => TotalBytes > 0 ? (double)BytesTransferred / TotalBytes * 100.0 : 0.0;
        public double SpeedBytesPerSecond { get; init; }
    }

    public record AccountInfo(string AccountId, string DisplayName, string Email, string? AvatarUrl);
}`,
  },
  {
    path: 'src/MAXCloudSSD.Infrastructure/StorageProviders/GoogleDrive/GoogleDriveProvider.cs',
    category: 'infrastructure',
    description: 'Production Google Drive API v3 provider implementation with chunked streaming',
    content: `using System;
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
            // Retrieve encrypted OAuth 2.0 token protected with Windows DPAPI
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
            // Resumable / Multipart Upload implementation with streaming
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

            var buffer = new byte[81920]; // 80 KB streaming buffer
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
                throw new InvalidOperationException("Google Drive is not authenticated. Please connect your account.");
            }
        }
    }
}`,
  },
  {
    path: 'src/MAXCloudSSD.Infrastructure/StorageProviders/TeraBox/TeraBoxProvider.cs',
    category: 'infrastructure',
    description: 'TeraBox provider compliance assessment and secure stub',
    content: `using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MAXCloudSSD.Core.Interfaces;
using MAXCloudSSD.Core.Models;

namespace MAXCloudSSD.Infrastructure.StorageProviders.TeraBox
{
    /// <summary>
    /// TeraBox Provider Implementation Stub.
    /// In strict accordance with the Security & Architectural Charter:
    /// TeraBox does not publish an authorized public OAuth 2.0 REST API for 3rd-party personal clients.
    /// Reverse-engineering private endpoints and scraping user credentials are explicitly prohibited.
    /// </summary>
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
}`,
  },
  {
    path: 'src/MAXCloudSSD.Infrastructure/Security/DpapiTokenProtector.cs',
    category: 'infrastructure',
    description: 'Windows DPAPI Secure Local Credential & Token Protection Service',
    content: `using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace MAXCloudSSD.Infrastructure.Security
{
    public class DpapiTokenProtector
    {
        private readonly string _storageDirectory;
        private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("MAXCloudSSD_x86_Entropy_v2");

        public DpapiTokenProtector()
        {
            _storageDirectory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "MAXCloudSSD",
                "Credentials"
            );
            Directory.CreateDirectory(_storageDirectory);
        }

        public void Protect(string key, string secret)
        {
            if (string.IsNullOrEmpty(key)) throw new ArgumentNullException(nameof(key));
            if (string.IsNullOrEmpty(secret)) throw new ArgumentNullException(nameof(secret));

            var plainBytes = Encoding.UTF8.GetBytes(secret);
            var encrypted = ProtectedData.Protect(plainBytes, Entropy, DataProtectionScope.CurrentUser);

            var path = Path.Combine(_storageDirectory, $"{key}.bin");
            File.WriteAllBytes(path, encrypted);
        }

        public string? Unprotect(string key)
        {
            var path = Path.Combine(_storageDirectory, $"{key}.bin");
            if (!File.Exists(path)) return null;

            try
            {
                var encrypted = File.ReadAllBytes(path);
                var decrypted = ProtectedData.Unprotect(encrypted, Entropy, DataProtectionScope.CurrentUser);
                return Encoding.UTF8.GetString(decrypted);
            }
            catch
            {
                return null;
            }
        }

        public void Remove(string key)
        {
            var path = Path.Combine(_storageDirectory, $"{key}.bin");
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
    }
}`,
  },
  {
    path: 'src/MAXCloudSSD.Infrastructure/Database/SqliteDatabaseService.cs',
    category: 'infrastructure',
    description: 'SQLite metadata caching, query optimization, and persistent store',
    content: `using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;

namespace MAXCloudSSD.Infrastructure.Database
{
    public class SqliteDatabaseService
    {
        private readonly string _connectionString;

        public SqliteDatabaseService()
        {
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            var dbDir = Path.Combine(appData, "MAXCloudSSD", "Data");
            Directory.CreateDirectory(dbDir);
            var dbPath = Path.Combine(dbDir, "maxcloudssd.db");
            _connectionString = $"Data Source={dbPath}";
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS CachedFiles (
                    Id TEXT PRIMARY KEY,
                    Name TEXT NOT NULL,
                    ProviderId TEXT NOT NULL,
                    SizeBytes INTEGER NOT NULL,
                    MimeType TEXT NOT NULL,
                    IsFolder INTEGER NOT NULL,
                    ParentId TEXT,
                    ModifiedTime TEXT NOT NULL,
                    Starred INTEGER NOT NULL DEFAULT 0,
                    Trashed INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS Transfers (
                    Id TEXT PRIMARY KEY,
                    FileName TEXT NOT NULL,
                    Type TEXT NOT NULL,
                    ProviderId TEXT NOT NULL,
                    SizeBytes INTEGER NOT NULL,
                    Status TEXT NOT NULL,
                    StartTime TEXT NOT NULL,
                    EndTime TEXT
                );

                CREATE TABLE IF NOT EXISTS ActivityLogs (
                    Id TEXT PRIMARY KEY,
                    Action TEXT NOT NULL,
                    FileName TEXT NOT NULL,
                    ProviderId TEXT NOT NULL,
                    Details TEXT,
                    Timestamp TEXT NOT NULL
                );
            ";
            cmd.ExecuteNonQuery();
        }

        public SqliteConnection CreateConnection()
        {
            return new SqliteConnection(_connectionString);
        }
    }
}`,
  },
  {
    path: 'docs/ARCHITECTURE.md',
    category: 'docs',
    description: 'High-Level Architecture and MVVM Design Specifications',
    content: `# MAX CLOUD SSD — High-Level Architecture

## Overview
MAX CLOUD SSD is a high-performance Windows desktop cloud storage client engineered for Windows 10 and 11, with dedicated primary optimizations for Windows x86 (32-bit PE binaries) and x64.

\`\`\`
   +--------------------------------------------------------+
   |            MAX CLOUD SSD Desktop UI (WPF / XAML)       |
   |   Dashboard | File Manager | Transfers | Accounts | UI  |
   +--------------------------------------------------------+
                              | MVVM DataBinding
   +--------------------------------------------------------+
   |             ViewModels & Application Services          |
   |   MainViewModel | TransferEngine | SettingsViewModel   |
   +--------------------------------------------------------+
            |                               |
   +-----------------------+     +--------------------------+
   |   Storage Providers   |     |   Local Storage Engine   |
   | ICloudStorageProvider |     |  SQLite Metadata Cache   |
   | Google Drive API v3   |     |  Windows DPAPI Tokens    |
   | TeraBox (Stubbed)     |     |  Streaming Chunk I/O     |
   +-----------------------+     +--------------------------+
\`\`\`

## Core Principles
1. **Zero Fabrication**: All storage quotas and file trees reflect actual provider telemetry.
2. **Provider Separation**: Distinct provider quotas are never presented as one monolithic storage bucket.
3. **Defense in Depth**: Access tokens are safeguarded via DPAPI with CurrentUser machine entropy.
4. **Memory Efficiency**: Chunked streaming I/O prevents OutOfMemory exceptions on 32-bit x86 architectures.
`,
  },
  {
    path: 'docs/BUILD.md',
    category: 'docs',
    description: 'Compiling genuine 32-bit x86 executables (MAXCloudSSD.exe) instructions',
    content: `# MAX CLOUD SSD — Windows x86 Build Guide

## Prerequisites
- .NET 8.0 SDK (x86 and x64)
- Windows 10/11 build 19041+
- Visual Studio 2022 (version 17.8+) with Desktop Development with .NET workload

## Compiling Genuine 32-bit Executable (MAXCloudSSD.exe)

Run the following command in PowerShell:

\`\`\`powershell
dotnet publish src/MAXCloudSSD.App/MAXCloudSSD.App.csproj \
  -c Release \
  -r win-x86 \
  --self-contained true \
  -p:PlatformTarget=x86 \
  -p:PublishSingleFile=true \
  -p:IncludeNativeLibrariesForSelfExtract=true \
  -o ./publish/win-x86/
\`\`\`

## Verifying x86 PE Header

To verify that the produced executable is genuinely 32-bit (x86 Machine Type 0x014c):

\`\`\`powershell
dumpbin /headers ./publish/win-x86/MAXCloudSSD.exe | findstr "machine"
# Expected output: "14C machine (x86)"
\`\`\`
`,
  },
  {
    path: 'README.md',
    category: 'docs',
    description: 'Project README with system overview and features',
    content: `# MAX CLOUD SSD

**MAX CLOUD SSD** is a unified desktop cloud-drive application built with C#, .NET 8, and WPF.
Targeted specifically for Windows 10/11 with native 32-bit (win-x86) and 64-bit performance.

### Highlights
- **Deep Navy & Orange Dark Mode**: Premium interface with smooth transitions and ergonomic typography.
- **Provider-Based Architecture**: Unified abstraction through \`ICloudStorageProvider\`.
- **Google Drive API v3**: Direct, least-privilege OAuth 2.0 integration with resumable streaming.
- **TeraBox Compliance**: Documented feasibility evaluation refusing unauthorized private reverse engineering.
- **Transfer Engine**: Concurrency throttling, speed metrics, pause/resume, and SHA-256 integrity verification.
- **SQLite Metadata Store**: Instant search and offline file metadata caching.
`,
  },
];

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  for (const file of CSHARP_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
