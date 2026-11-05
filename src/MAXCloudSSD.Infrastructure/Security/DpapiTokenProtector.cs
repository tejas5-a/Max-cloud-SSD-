using System;
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
}
