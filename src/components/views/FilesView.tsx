import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Folder,
  FolderOpen,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File,
  MoreVertical,
  Star,
  Download,
  Trash2,
  Edit2,
  Share2,
  Eye,
  ChevronRight,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  Upload,
  HardDrive,
  Cloud,
} from 'lucide-react';
import type { CloudFile, CloudProviderId, FileCategory } from '../../types';

interface FilesViewProps {
  files: CloudFile[];
  currentFolderId: string | null;
  onNavigateFolder: (folderId: string | null, folderName?: string) => void;
  folderPath: { id: string | null; name: string }[];
  onOpenFilePreview: (file: CloudFile) => void;
  onDownloadFile: (file: CloudFile) => void;
  onToggleStar: (file: CloudFile) => void;
  onRenameFile: (file: CloudFile) => void;
  onShareFile: (file: CloudFile) => void;
  onDeleteFiles: (files: CloudFile[], permanent: boolean) => void;
  onOpenUploadModal: () => void;
  onOpenNewFolderModal: () => void;
  providerFilter: CloudProviderId | 'all';
  onProviderFilterChange: (p: CloudProviderId | 'all') => void;
  searchQuery: string;
}

type SortField = 'name' | 'modifiedTime' | 'sizeBytes' | 'category';
type SortOrder = 'asc' | 'desc';

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  currentFolderId,
  onNavigateFolder,
  folderPath,
  onOpenFilePreview,
  onDownloadFile,
  onToggleStar,
  onRenameFile,
  onShareFile,
  onDeleteFiles,
  onOpenUploadModal,
  onOpenNewFolderModal,
  providerFilter,
  onProviderFilterChange,
  searchQuery,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<FileCategory | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter & Sort
  const filteredFiles = useMemo(() => {
    let result = files.filter((f) => !f.trashed);

    // Folder navigation filter (if not in a search mode)
    if (!searchQuery) {
      result = result.filter((f) => (f.parentId || null) === currentFolderId);
    }

    // Provider filter
    if (providerFilter !== 'all') {
      result = result.filter((f) => f.provider === providerFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((f) => f.category === categoryFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );
    }

    // Sort: Folders always on top, then by sortField
    result.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      let compare = 0;
      if (sortField === 'name') {
        compare = a.name.localeCompare(b.name);
      } else if (sortField === 'modifiedTime') {
        compare = new Date(a.modifiedTime).getTime() - new Date(b.modifiedTime).getTime();
      } else if (sortField === 'sizeBytes') {
        compare = a.sizeBytes - b.sizeBytes;
      } else if (sortField === 'category') {
        compare = a.category.localeCompare(b.category);
      }

      return sortOrder === 'asc' ? compare : -compare;
    });

    return result;
  }, [files, currentFolderId, providerFilter, categoryFilter, searchQuery, sortField, sortOrder]);

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredFiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const getSelectedFiles = () => filteredFiles.filter((f) => selectedIds.has(f.id));

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getFileIcon = (file: CloudFile) => {
    if (file.isFolder) return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    switch (file.category) {
      case 'image':
        return <FileImage className="w-5 h-5 text-blue-400" />;
      case 'video':
        return <FileVideo className="w-5 h-5 text-rose-400" />;
      case 'audio':
        return <FileAudio className="w-5 h-5 text-purple-400" />;
      case 'document':
      case 'pdf':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'archive':
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      case 'executable':
        return <FileCode className="w-5 h-5 text-orange-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const categories: { id: FileCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Files' },
    { id: 'folder', label: 'Folders' },
    { id: 'document', label: 'Documents' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'archive', label: 'Archives' },
    { id: 'executable', label: 'Executables' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Top Controls: Breadcrumb, Filters, View Toggle */}
      <div className="p-4 border-b border-[#1E293B] bg-[#0A0F1D] flex flex-col gap-3">
        {/* Breadcrumb Navigation & View Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 overflow-x-auto py-1">
            <button
              onClick={() => onNavigateFolder(null)}
              className="hover:text-orange-400 font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              My Storage
            </button>
            {folderPath.map((crumb, idx) => (
              <React.Fragment key={crumb.id || idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <button
                  onClick={() => onNavigateFolder(crumb.id, crumb.name)}
                  className={`px-2 py-1 rounded transition-colors truncate max-w-[140px] ${
                    idx === folderPath.length - 1
                      ? 'text-orange-400 font-bold bg-orange-950/30'
                      : 'hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Batch actions bar if items are selected */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 mr-3 px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-500/40 text-xs">
                <span className="text-orange-400 font-bold">{selectedIds.size} selected</span>
                <button
                  onClick={() => onDeleteFiles(getSelectedFiles(), false)}
                  className="p-1 rounded text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                  title="Move selected to Recycle Bin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Provider Filter Dropdown */}
            <select
              value={providerFilter}
              onChange={(e) => onProviderFilterChange(e.target.value as any)}
              className="bg-[#10172A] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Providers</option>
              <option value="googledrive">Google Drive Only</option>
              <option value="localssd">MAX Local SSD Only</option>
            </select>

            {/* Sort Order Selector */}
            <button
              onClick={() => {
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              }}
              className="p-1.5 rounded-lg border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#141E34]"
              title={`Sorting ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-4 h-4 text-orange-400" />
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-lg border border-[#1E293B] bg-[#10172A] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                categoryFilter === cat.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-[#141E34] text-slate-400 hover:text-slate-200 hover:bg-[#1C2A48]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Files Display Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {filteredFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#141E34] border border-[#1E293B] flex items-center justify-center text-slate-500">
              <FolderOpen className="w-8 h-8 text-orange-400/60" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">No files found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload files or connect Google Drive to sync your cloud documents and media.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenUploadModal}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </button>
              <button
                onClick={onOpenNewFolderModal}
                className="px-4 py-2 rounded-xl bg-[#141E34] hover:bg-[#1A2642] border border-[#1E293B] text-slate-200 text-xs font-medium"
              >
                Create Folder
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredFiles.map((file) => {
              const isSelected = selectedIds.has(file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => {
                    if (file.isFolder) {
                      onNavigateFolder(file.id, file.name);
                    } else {
                      onOpenFilePreview(file);
                    }
                  }}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-orange-950/25 border-orange-500 ring-1 ring-orange-500'
                      : 'bg-[#0F172A] border-[#1E293B] hover:border-slate-600 hover:bg-[#141E34]'
                  }`}
                >
                  {/* Card top badges */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={(e) => toggleSelect(file.id, e)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Square className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(file);
                        }}
                        className={`p-1 rounded transition-colors ${
                          file.starred ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-current' : ''}`} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === file.id ? null : file.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === file.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-40 bg-[#0A0F1D] border border-[#1E293B] rounded-xl shadow-2xl py-1 z-30 animate-in fade-in duration-100"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onOpenFilePreview(file);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDownloadFile(file);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 flex items-center gap-2"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onShareFile(file);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 flex items-center gap-2"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share Link</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onRenameFile(file);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteFiles([file], false);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Move to Trash</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Icon or Thumbnail */}
                  <div className="h-24 rounded-xl bg-[#080D17] border border-[#1E293B]/70 flex items-center justify-center p-2 mb-2 overflow-hidden">
                    {file.category === 'image' && file.thumbnailUrl ? (
                      <img src={file.thumbnailUrl} alt={file.name} className="h-full object-contain" />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>

                  {/* Title and metadata */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{formatSize(file.sizeBytes)}</span>
                      <span className="uppercase font-mono text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                        {file.provider === 'googledrive' ? 'G-Drive' : 'NVMe'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="border border-[#1E293B] rounded-2xl bg-[#0F172A] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F1D] text-slate-400 font-semibold border-b border-[#1E293B]">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button onClick={selectAll} className="text-slate-400 hover:text-white">
                      {selectedIds.size === filteredFiles.length && filteredFiles.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Provider</th>
                  <th className="py-3 px-3">Modified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {filteredFiles.map((file) => {
                  const isSelected = selectedIds.has(file.id);
                  return (
                    <tr
                      key={file.id}
                      onClick={() => {
                        if (file.isFolder) onNavigateFolder(file.id, file.name);
                        else onOpenFilePreview(file);
                      }}
                      className={`hover:bg-[#141E34] cursor-pointer transition-colors ${
                        isSelected ? 'bg-orange-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4" onClick={(e) => toggleSelect(file.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5 max-w-sm truncate">
                          {getFileIcon(file)}
                          <span className="font-semibold text-slate-200 truncate">{file.name}</span>
                          {file.starred && <Star className="w-3 h-3 text-amber-400 fill-current shrink-0" />}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-slate-400">{file.category}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{formatSize(file.sizeBytes)}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {file.provider === 'googledrive' ? <Cloud className="w-3 h-3 text-blue-400" /> : <HardDrive className="w-3 h-3 text-orange-400" />}
                          <span className="capitalize">{file.provider}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(file.modifiedTime).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onDownloadFile(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onShareFile(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Share"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRenameFile(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFiles([file], false)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
