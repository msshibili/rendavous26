import React from 'react';
import type { Poster } from '../../types/poster';
import { Download, Share2, Eye, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { incrementDownloadCount, incrementShareCount } from '../../firebase/posterService';

interface PosterCardProps {
  poster: Poster;
  onSelect: (poster: Poster) => void;
  onUpdateStats?: () => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({ poster, onSelect, onUpdateStats }) => {
  const { showToast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await incrementDownloadCount(poster.id);
      if (onUpdateStats) onUpdateStats();

      // Download the poster graphic
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await incrementShareCount(poster.id);
      if (onUpdateStats) onUpdateStats();

      const shareUrl = `${window.location.origin}/explore?poster=${poster.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Poster link copied to clipboard!', 'success');
      } else {
        showToast('Link created for sharing!', 'info');
      }
    } catch (err) {
      showToast('Failed to copy share link.', 'error');
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'results':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'events':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'programs':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'announcements':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div
      onClick={() => onSelect(poster)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer poster-card"
    >
      {/* Featured Badge */}
      {poster.isFeatured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-amber-500/95 backdrop-blur-md text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
          <Sparkles className="w-3 h-3 fill-current" />
          Featured
        </div>
      )}

      {/* Category Pill */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getCategoryBadgeClass(poster.category)}`}>
          {poster.category}
        </span>
      </div>

      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden flex items-center justify-center">
        <img
          src={poster.thumbnailUrl || poster.posterUrl}
          alt={poster.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center gap-3 p-4">
          <button
            onClick={() => onSelect(poster)}
            className="p-3 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg hover:scale-110 transition-all"
            title="Preview Poster"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:scale-110 transition-all"
            title="Download Poster"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg hover:scale-110 transition-all"
            title="Share Link"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <span>{poster.eventName}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {poster.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {poster.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{poster.eventDate || new Date(poster.uploadedAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <span title="Downloads" className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              {poster.downloadCount || 0}
            </span>
            <span title="Shares" className="flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              {poster.shareCount || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
