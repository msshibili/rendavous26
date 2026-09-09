import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Download,
  Share2,
  LogOut,
  Sparkles,
  Layers,
  X,
  Palette,
  Upload,
  Image as ImageIcon,
  FileImage,
  CheckCircle2,
  Loader2,
  CloudUpload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Poster, PosterStats } from '../types/poster';
import {
  getPosters,
  getPosterStats,
  subscribeToPosters,
  createPoster,
  updatePoster,
  deletePoster
} from '../firebase/posterService';
import { uploadPosterImage } from '../firebase/storageService';
import { generatePosterGraphic } from '../utils/posterGraphicGenerator';
import { createSlug } from '../utils/slug';

const THEME_COLORS = [
  { name: 'Emerald Green', hex: '#1B9B53' },
  { name: 'Festival Navy', hex: '#2C365E' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Royal Purple', hex: '#7C3AED' },
  { name: 'Deep Teal', hex: '#0D9488' },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [posters, setPosters] = useState<Poster[]>([]);
  const [stats, setStats] = useState<PosterStats>({
    totalPosters: 0,
    publishedCount: 0,
    draftCount: 0,
    featuredCount: 0,
    totalDownloads: 0,
    totalShares: 0,
  });
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'generator'>('upload');
  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('Events');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [themeColor, setThemeColor] = useState('#1B9B53');
  const [headlineText, setHeadlineText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToPosters(
      (fetchedPosters) => {
        setPosters(fetchedPosters);
        setStats({
          totalPosters: fetchedPosters.length,
          publishedCount: fetchedPosters.filter((p) => p.isPublished).length,
          draftCount: fetchedPosters.filter((p) => !p.isPublished).length,
          featuredCount: fetchedPosters.filter((p) => p.isFeatured).length,
          totalDownloads: fetchedPosters.reduce((sum, p) => sum + (p.downloadCount || 0), 0),
          totalShares: fetchedPosters.reduce((sum, p) => sum + (p.shareCount || 0), 0),
        });
        setLoading(false);
      },
      { isPublished: false }
    );

    return () => unsubscribe();
  }, [user]);

  const fetchDashboardData = () => {
    // Real-time Firestore subscription automatically handles data refresh
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP, SVG).', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('File size must be under 15MB.', 'error');
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully.', 'info');
    navigate('/admin/login');
  };

  const handleTogglePublish = async (poster: Poster) => {
    try {
      const updated = await updatePoster(poster.id, { isPublished: !poster.isPublished });
      showToast(
        `Poster "${updated.title}" is now ${updated.isPublished ? 'Published' : 'Draft'}`,
        'success'
      );
      fetchDashboardData();
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleToggleFeatured = async (poster: Poster) => {
    try {
      const updated = await updatePoster(poster.id, { isFeatured: !poster.isFeatured });
      showToast(
        `Poster "${updated.title}" is now ${updated.isFeatured ? 'Featured' : 'Standard'}`,
        'success'
      );
      fetchDashboardData();
    } catch (e) {
      showToast('Failed to update featured state', 'error');
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (window.confirm(`Are you sure you want to delete poster "${titleStr}"?`)) {
      try {
        await deletePoster(id);
        showToast('Poster deleted successfully.', 'info');
        fetchDashboardData();
      } catch (e) {
        showToast('Failed to delete poster', 'error');
      }
    }
  };

  const handleCreatePosterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventName.trim()) {
      showToast('Please fill in Title and Event Name.', 'error');
      return;
    }

    if (uploadMode === 'upload' && !selectedFile && !customImageUrl.trim()) {
      showToast('Please select an image file to upload or provide an image URL.', 'error');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      let finalPosterUrl = '';
      let finalStoragePath = '';

      if (uploadMode === 'upload' && selectedFile) {
        // Upload image file to Firebase Storage (with local data URL fallback)
        const uploadRes = await uploadPosterImage(selectedFile, (progress) => {
          setUploadProgress(Math.round(progress));
        });
        finalPosterUrl = uploadRes.url;
        finalStoragePath = uploadRes.path;
      } else if (customImageUrl.trim()) {
        finalPosterUrl = customImageUrl.trim();
        finalStoragePath = `posters/2026/custom/${createSlug(title.trim())}`;
      } else {
        const graphicSvg = generatePosterGraphic(
          title.trim(),
          category,
          eventName.trim(),
          themeColor,
          headlineText.trim() || category.toUpperCase()
        );
        finalPosterUrl = graphicSvg;
        finalStoragePath = `posters/2026/generated/${createSlug(title.trim())}.svg`;
      }

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await createPoster({
        title: title.trim(),
        slug: createSlug(title.trim()),
        description: description.trim() || `${eventName} publication for Rendezvous 26.`,
        category,
        eventName: eventName.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ['rendezvous26', category.toLowerCase()],
        posterUrl: finalPosterUrl,
        storagePath: finalStoragePath,
        thumbnailUrl: finalPosterUrl,
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        isFeatured,
        isPublished,
      });

      showToast(`Poster "${title.trim()}" published successfully!`, 'success');
      setIsModalOpen(false);
      resetForm();
      fetchDashboardData();
    } catch (err: any) {
      console.error("Error creating poster:", err);
      showToast('Error creating poster: ' + (err?.message || 'Upload failed'), 'error');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle('');
    setEventName('');
    setCategory('Events');
    setDescription('');
    setTags('');
    setEventDate('');
    setThemeColor('#1B9B53');
    setHeadlineText('');
    setIsFeatured(false);
    setIsPublished(true);
    setCustomImageUrl('');
    setUploadMode('upload');
    removeSelectedFile();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-white leading-none">
                  Rendezvous '26 CMS
                </h1>
                <span className="text-xs text-slate-400">
                  Logged in as {user?.email || user?.displayName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                View Live Site
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Release New Poster
              </button>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Publications</span>
            <div className="text-3xl font-black text-white mt-1">{stats.totalPosters}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Published</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{stats.publishedCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Drafts</span>
            <div className="text-3xl font-black text-amber-400 mt-1">{stats.draftCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Downloads</span>
            <div className="text-3xl font-black text-blue-400 mt-1">{stats.totalDownloads}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Shares</span>
            <div className="text-3xl font-black text-purple-400 mt-1">{stats.totalShares}</div>
          </div>
        </div>

        {/* Posters Table & Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Manage Poster Publications ({posters.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle visibility, edit details, or release new graphics.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Poster
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Poster</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Featured</th>
                  <th className="py-4 px-6 text-center">Stats</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {posters.map((poster) => (
                  <tr key={poster.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={poster.thumbnailUrl}
                        alt=""
                        className="w-12 h-16 object-cover rounded-lg border border-slate-700 bg-slate-950"
                      />
                      <div>
                        <div className="font-bold text-white text-sm line-clamp-1">{poster.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{poster.eventDate || 'No Date'}</div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold text-[11px]">
                        {poster.category}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-300 font-semibold">{poster.eventName}</td>

                    {/* Status Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleTogglePublish(poster)}
                        className={`px-3 py-1 rounded-full font-bold text-[11px] border transition-all inline-flex items-center gap-1 ${
                          poster.isPublished
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : 'bg-amber-950/80 text-amber-400 border-amber-800'
                        }`}
                      >
                        {poster.isPublished ? (
                          <>
                            <Eye className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleFeatured(poster)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          poster.isFeatured
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className={`w-4 h-4 ${poster.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Stats */}
                    <td className="py-4 px-6 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-3">
                        <span title="Downloads" className="flex items-center gap-1 text-emerald-400">
                          <Download className="w-3.5 h-3.5" />
                          {poster.downloadCount || 0}
                        </span>
                        <span title="Shares" className="flex items-center gap-1 text-amber-400">
                          <Share2 className="w-3.5 h-3.5" />
                          {poster.shareCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(poster.id, poster.title)}
                        className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/60 transition-colors"
                        title="Delete Poster"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Release New Poster Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-slate-100">
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <CloudUpload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Release New Festival Poster</h3>
                <p className="text-xs text-slate-400">Upload custom artwork to Firebase or generate dynamic SVG designs</p>
              </div>
            </div>

            {/* Upload Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setUploadMode('upload')}
                className={`py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  uploadMode === 'upload'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Manual Image Upload (Firebase)
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('generator')}
                className={`py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  uploadMode === 'generator'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Auto SVG Graphic Generator
              </button>
            </div>

            <form onSubmit={handleCreatePosterSubmit} className="space-y-5">
              {/* Form Metadata Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Poster Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grand Calligraphy Championship Winner Announcement"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Event / Festival Sub-program *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Calligraphy Contest / Badrul Huda"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:border-emerald-500 text-white"
                  >
                    <option value="Results">🏆 Results (Competition Winners / Scores)</option>
                    <option value="Events">📅 Events (Schedule & Programs)</option>
                    <option value="Programs">✨ Programs (Exhibitions & Workshops)</option>
                    <option value="Announcements">📢 Announcements (Alerts & Registration)</option>
                    <option value="Highlights">⭐ Highlights (Memories)</option>
                    <option value="Other">📌 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Event / Publication Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>
              </div>

              {/* MODE 1: MANUAL FILE UPLOAD */}
              {uploadMode === 'upload' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Upload Poster Image File (PNG, JPG, WebP, SVG)
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />

                  {/* Drag & Drop Area */}
                  {!filePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-950/60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">
                        Drag and drop your poster image here, or{' '}
                        <span className="text-emerald-400 underline">browse computer</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Supports PNG, JPG, WEBP, SVG up to 15MB. Automatically saved to Firebase Storage.
                      </p>
                    </div>
                  ) : (
                    /* Image Selected Preview Card */
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-32 h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 relative">
                        <img
                          src={filePreview}
                          alt="Poster Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          Image Ready for Upload
                        </div>

                        <div className="font-extrabold text-white text-sm line-clamp-1">
                          {selectedFile?.name || 'Uploaded Custom Artwork'}
                        </div>

                        {selectedFile && (
                          <div className="text-xs text-slate-400">
                            Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB | Type: {selectedFile.type}
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                          >
                            Change File
                          </button>
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-xs font-bold text-red-400 border border-red-900"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Or Direct Image URL Input */}
                  <div className="pt-2">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">
                      Or paste an external Image URL (Optional):
                    </span>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://example.com/poster-results.jpg"
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* MODE 2: AUTO SVG GENERATOR */}
              {uploadMode === 'generator' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Theme Color Palette
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {THEME_COLORS.map((c) => (
                          <button
                            type="button"
                            key={c.hex}
                            onClick={() => setThemeColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-7 h-7 rounded-full transition-transform ${
                              themeColor === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Poster Subtitle / Headline Tag
                      </label>
                      <input
                        type="text"
                        value={headlineText}
                        onChange={(e) => setHeadlineText(e.target.value)}
                        placeholder="e.g. OFFICIAL WINNERS ANNOUNCEMENT"
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>
                  </div>

                  {/* SVG Live Preview Box */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Palette className="w-4 h-4" />
                      Generated SVG Preview
                    </div>
                    <div className="h-44 bg-slate-950 rounded-2xl flex items-center justify-center p-3 overflow-hidden border border-slate-800">
                      <img
                        src={generatePosterGraphic(
                          title || 'Result Poster Title',
                          category,
                          eventName || 'Event Name',
                          themeColor,
                          headlineText || category.toUpperCase()
                        )}
                        alt="Preview"
                        className="h-full w-auto object-contain rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="results, calligraphy, winners, rendezvous26"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={1}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Official results announcement and highlights..."
                    className="w-full py-2 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  Publish Immediately to Site
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  Feature on Homepage Banner
                </label>
              </div>

              {/* Upload Progress Bar */}
              {submitting && uploadProgress > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Firebase Storage...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing Poster...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Publish Poster
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
