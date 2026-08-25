import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogIn, LogOut, User, BookOpen, Home, Info } from 'lucide-react';

export const Navbar = ({ onOpenAuth, onOpenAdmin }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-sky-200/80 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('top')}>
            <img 
              src="/logo.jpg" 
              alt="MH VISION Logo" 
              className="h-12 w-12 rounded-full object-cover border-2 border-sky-500 shadow-md shadow-sky-500/20 hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl sm:text-2xl tracking-wider text-sky-600 dark:text-sky-400">
                  MH VISION
                </span>
              </div>
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Malayalam Knowledge Hub
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => scrollToSection('top')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all"
            >
              <Home className="w-4 h-4 text-sky-500" />
              <span>Home</span>
            </button>

            <button
              onClick={() => scrollToSection('collection')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all"
            >
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span>Collection</span>
            </button>

            <button
              onClick={() => scrollToSection('about')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all"
            >
              <Info className="w-4 h-4 text-sky-500" />
              <span>About</span>
            </button>
          </nav>

          {/* Controls: Theme Toggle & User Auth */}
          <div className="flex items-center space-x-3">
            
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light (White & Light Blue)' : 'Dark'} Mode`}
              className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-slate-700 hover:bg-sky-100 transition-colors shadow-xs"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-sky-600" />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-sky-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-slate-700">
                  <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 text-xs font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-sky-200 dark:border-slate-800 space-y-2">
            <button
              onClick={() => scrollToSection('top')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50"
            >
              <Home className="w-5 h-5 text-sky-500" />
              <span>Home</span>
            </button>
            <button
              onClick={() => scrollToSection('collection')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50"
            >
              <BookOpen className="w-5 h-5 text-sky-500" />
              <span>PDF Collection</span>
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50"
            >
              <Info className="w-5 h-5 text-sky-500" />
              <span>About MH VISION</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
