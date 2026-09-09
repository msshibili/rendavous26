import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Layers, Sparkles, X } from 'lucide-react';
import type { Poster } from '../types/poster';
import { getPosters, subscribeToPosters } from '../firebase/posterService';
import { PosterCard } from '../components/poster/PosterCard';
import { PosterModal } from '../components/poster/PosterModal';

const CATEGORIES = ['All', 'Results', 'Events', 'Programs', 'Announcements', 'Highlights'];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  const initialCat = searchParams.get('cat') || 'All';
  const initialQ = searchParams.get('q') || '';
  const initialPosterId = searchParams.get('poster');

  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'downloads' | 'featured'>('latest');
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPosters(
      (fetched) => {
        setPosters(fetched);
        if (initialPosterId) {
          const found = fetched.find((p) => p.id === initialPosterId);
          if (found) setSelectedPoster(found);
        }
        setLoading(false);
      },
      {
        category: selectedCategory,
        searchQuery: searchQuery,
        sortBy: sortBy,
        isPublished: true,
      }
    );

    return () => unsubscribe();
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('cat');
    else newParams.set('cat', cat);
    setSearchParams(newParams);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val.trim()) newParams.delete('q');
    else newParams.set('q', val.trim());
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col paper-texture">
      {/* Header Bar */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
                <Layers className="w-4 h-4" />
                Rendezvous 26 Digital Archive
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Explore Poster Hub
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Filter and download official stage graphics, event scorecards, and announcements.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by title, event, tag..."
                className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 text-sm font-medium focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs & Sorting */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="latest">Latest First</option>
                <option value="downloads">Most Downloaded</option>
                <option value="featured">Featured First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* Grid Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-slate-200 aspect-[3/4] rounded-2xl"></div>
            ))}
          </div>
        ) : posters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto my-10 p-8 shadow-sm">
            <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Posters Found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try modifying your search filter or selecting another category.
            </p>
            <button
              onClick={() => {
                handleCategoryChange('All');
                handleSearchChange('');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posters.map((poster) => (
              <PosterCard
                key={poster.id}
                poster={poster}
                onSelect={setSelectedPoster}

              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <PosterModal
        poster={selectedPoster}
        onClose={() => {
          setSelectedPoster(null);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('poster');
          setSearchParams(newParams);
        }}
      />
    </div>
  );
};
