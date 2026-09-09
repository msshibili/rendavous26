import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Trophy, Calendar, Download, Share2, ArrowRight, Layers, Filter } from 'lucide-react';
import type { Poster, PosterStats } from '../types/poster';
import { getPosters, getPosterStats } from '../firebase/posterService';
import { PosterCard } from '../components/poster/PosterCard';
import { PosterModal } from '../components/poster/PosterModal';

const CATEGORIES = ['All', 'Results', 'Events', 'Programs', 'Announcements', 'Highlights'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPosters, fetchedStats] = await Promise.all([
        getPosters({ isPublished: true }),
        getPosterStats(),
      ]);
      setPosters(fetchedPosters);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error loading homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const featuredPosters = posters.filter((p) => p.isFeatured);
  const resultsPosters = posters.filter((p) => p.category.toLowerCase() === 'results');

  const filteredPosters = posters.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col paper-texture">
      {/* Hero Banner */}
      <section className="relative overflow-hidden festival-hero-bg py-16 lg:py-24 border-b border-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-700/10 border border-emerald-700/20 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Official Release Portal • Rendezvous 26
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto mb-4">
            Badrul Huda Life Festival <br />
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
              RENDEZVOUS 26
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-medium">
            Explore official stage posters, competition scorecards, event announcements & downloadable high-res vector graphics for <em>Decoding Phytolore</em>.
          </p>

          {/* Search Bar Container */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mb-8 shadow-xl rounded-2xl">
            <div className="relative flex items-center">
              <Search className="w-6 h-6 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event, category, or title (e.g. Calligraphy, Elocution...)"
                className="w-full py-4 pl-13 pr-32 rounded-2xl bg-white border-2 border-slate-200 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Quick Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-105'
                    : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                }`}
              >
                {cat === 'Results' && <Trophy className="w-3.5 h-3.5" />}
                {cat === 'Events' && <Calendar className="w-3.5 h-3.5" />}
                {cat}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3">
            <div className="text-3xl font-black text-emerald-400 mb-1">{stats.totalPosters || posters.length}</div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-400">Total Posters</div>
          </div>
          <div className="p-3">
            <div className="text-3xl font-black text-amber-400 mb-1">{stats.totalDownloads || 1200}+</div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center justify-center gap-1">
              <Download className="w-3.5 h-3.5" /> Downloads
            </div>
          </div>
          <div className="p-3">
            <div className="text-3xl font-black text-blue-400 mb-1">{stats.totalShares || 650}+</div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center justify-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Shares
            </div>
          </div>
          <div className="p-3">
            <div className="text-3xl font-black text-purple-400 mb-1">Rendezvous '26</div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-400">Festival Edition</div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-16">
        
        {/* Filtered Search Results (if user filtered or searched) */}
        {(selectedCategory !== 'All' || searchQuery.trim()) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                Filtered Results ({filteredPosters.length})
              </h2>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Clear Filters
              </button>
            </div>

            {filteredPosters.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 font-medium">No posters match your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPosters.map((poster) => (
                  <PosterCard
                    key={poster.id}
                    poster={poster}
                    onSelect={setSelectedPoster}
                    onUpdateStats={loadData}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Posters Showcase */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Official Highlights</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Featured Stage Posters</h2>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All Posters
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPosters.slice(0, 4).map((poster) => (
              <PosterCard
                key={poster.id}
                poster={poster}
                onSelect={setSelectedPoster}
                onUpdateStats={loadData}
              />
            ))}
          </div>
        </section>

        {/* Competition Results & Scorecards Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Competition Scoreboards</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Trophy className="w-7 h-7 text-amber-500" />
                Latest Competition Results
              </h2>
            </div>
            <button
              onClick={() => navigate('/explore?cat=Results')}
              className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:gap-2 transition-all"
            >
              Explore Results
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(resultsPosters.length > 0 ? resultsPosters : posters).slice(0, 4).map((poster) => (
              <PosterCard
                key={poster.id}
                poster={poster}
                onSelect={setSelectedPoster}
                onUpdateStats={loadData}
              />
            ))}
          </div>
        </section>

        {/* All Posters Gallery */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Complete Gallery</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-7 h-7 text-emerald-600" />
                All Festival Publications
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posters.map((poster) => (
              <PosterCard
                key={poster.id}
                poster={poster}
                onSelect={setSelectedPoster}
                onUpdateStats={loadData}
              />
            ))}
          </div>
        </section>

      </main>

      {/* Detail Modal */}
      <PosterModal
        poster={selectedPoster}
        onClose={() => setSelectedPoster(null)}
        onUpdateStats={loadData}
      />
    </div>
  );
};
