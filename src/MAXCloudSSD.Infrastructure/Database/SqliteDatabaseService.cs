using System;
using System.IO;
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
            ";
            cmd.ExecuteNonQuery();
        }

        public SqliteConnection CreateConnection()
        {
            return new SqliteConnection(_connectionString);
        }
    }
}
