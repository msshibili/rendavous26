import React from 'react';
import { Heart, Compass, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-emerald-900/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-[0.25em] text-emerald-400 uppercase leading-none">
                  Badrul Huda Life Festival
                </span>
                <span className="font-extrabold text-lg tracking-tight text-white leading-tight">
                  RENDEZVOUS <span className="text-amber-400">26</span>
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Official digital poster gallery & announcement hub for Rendezvous '26 — Decoding Phytolore. Download official stage graphics, competition result scoreboards, and event updates.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Festival Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-emerald-400 transition-colors">
                  Explore Poster Hub
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=Results" className="hover:text-emerald-400 transition-colors">
                  Competition Results
                </Link>
              </li>
              <li>
                <Link to="/explore?cat=Events" className="hover:text-emerald-400 transition-colors">
                  Event Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Admin & Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Festival Admin
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Media team & festival committee portal to release new posters & announcements.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              CMS Admin Login
            </Link>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Badrul Huda Life Festival — Rendezvous 26. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for Phytolore
          </p>
        </div>
      </div>
    </footer>
  );
};
