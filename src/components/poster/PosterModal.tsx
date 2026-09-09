import React from 'react';
import type { Poster } from '../../types/poster';
import { X, Download, Share2, Calendar, Tag, Layers, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { incrementDownloadCount, incrementShareCount } from '../../firebase/posterService';

interface PosterModalProps {
  poster: Poster | null;
  onClose: () => void;
  onUpdateStats?: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({ poster, onClose, onUpdateStats }) => {
  const { showToast } = useToast();

  if (!poster) return null;

  const handleDownload = async () => {
    try {
      await incrementDownloadCount(poster.id);
      if (onUpdateStats) onUpdateStats();

      const link = document.createElement('a');
      link.href = poster.posterUrl;
      link.download = `${poster.slug || 'rendezvous-poster'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Poster downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to download poster.', 'error');
    }
  };

  const handleShare = async () => {
    try {
      await incrementShareCount(poster.id);
      if (onUpdateStats) onUpdateStats();

      const shareUrl = `${window.location.origin}/explore?poster=${poster.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!', 'success');
      } else {
        showToast('Share link generated!', 'info');
      }
    } catch (err) {
      showToast('Failed to copy link.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Container */}
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white backdrop-blur-sm transition-all"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Poster Display */}
        <div className="md:w-3/5 bg-slate-950 flex items-center justify-center p-6 min-h-[400px]">
          <div className="max-h-[75vh] max-w-full flex items-center justify-center">
            <img
              src={poster.posterUrl}
              alt={poster.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Right Info Details Panel */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between bg-slate-50">
          <div>
            {/* Category & Festival Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                {poster.category}
              </span>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {poster.eventName}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug mb-3">
              {poster.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {poster.description}
            </p>

            {/* Meta Grid */}
            <div className="space-y-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
              {poster.eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700">Event Date:</span>
                  <span>{poster.eventDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-700">Released:</span>
                <span>{new Date(poster.uploadedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 font-medium">
                <div><strong className="text-slate-900">{poster.downloadCount || 0}</strong> Downloads</div>
                <div><strong className="text-slate-900">{poster.shareCount || 0}</strong> Shares</div>
              </div>
            </div>

            {/* Tags */}
            {poster.tags && poster.tags.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {poster.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-200 text-slate-700 font-medium hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Download & Share Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download High-Res
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
