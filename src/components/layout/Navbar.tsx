import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Shield, Menu, X, Compass, Home, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-emerald-900/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Festival Logo & Branding */}
          <Link to="/" className="flex items-center gap-3.5 group">
            {/* Emblem SVG */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white stroke-current stroke-[2]">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12L4 7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12l8-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-[0.25em] text-emerald-700 uppercase leading-none mb-1">
                Badrul Huda Life Festival
              </span>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none group-hover:text-emerald-700 transition-colors">
                RENDEZVOUS <span className="text-amber-500">26</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold tracking-wide transition-colors flex items-center gap-2 ${
                isActive('/') ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link
              to="/explore"
              className={`text-sm font-semibold tracking-wide transition-colors flex items-center gap-2 ${
                isActive('/explore') ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Posters
            </Link>

            <button
              onClick={() => navigate('/explore?cat=Results')}
              className="text-sm font-semibold text-slate-600 hover:text-emerald-700 tracking-wide transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Results & Events
            </button>
          </nav>

          {/* Right Action Icons & Admin Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/explore')}
              className="p-2.5 rounded-full text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Search Posters"
              aria-label="Search Posters"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                CMS Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Admin Login"
                aria-label="Admin Login"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigate('/explore')}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Compass className="w-4 h-4" />
            Explore Posters
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/explore?cat=Results');
            }}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Layers className="w-4 h-4" />
            Results & Categories
          </button>
          
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-2"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Access
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
