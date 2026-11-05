using System;

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
}
