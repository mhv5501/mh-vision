import React from 'react';
import { ShieldCheck, Zap, Award } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" className="py-12 sm:py-16 border-t border-sky-100 dark:border-slate-800 scroll-mt-24">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <img src="/logo.jpg" alt="MH VISION" className="h-16 w-16 rounded-full mx-auto border-2 border-sky-500 shadow-md shadow-sky-500/20" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            About <span className="text-sky-600 dark:text-sky-400">MH VISION</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Malayalam Knowledge Hub — Think Smart, Stay Ahead. Your premier destination for high-quality, verified Malayalam PDF guides, educational materials, current affairs, and technical analysis.
          </p>
        </div>

        {/* 3 Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          <div className="p-5 bg-white dark:bg-slate-900 border border-sky-200/70 dark:border-slate-800 rounded-2xl text-center space-y-2 shadow-xs">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl w-fit mx-auto border border-sky-200 dark:border-sky-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm">Instant Cloud Access</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Purchased PDFs unlock immediately and remain accessible on any phone or laptop logged into your account.</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-sky-200/70 dark:border-slate-800 rounded-2xl text-center space-y-2 shadow-xs">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mx-auto border border-emerald-200 dark:border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm">Protected Reader</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Reading section features zoom controls, touch swipe, customizable dark/sepia modes, and watermark protection.</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-sky-200/70 dark:border-slate-800 rounded-2xl text-center space-y-2 shadow-xs">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl w-fit mx-auto border border-blue-200 dark:border-blue-500/20">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm">Curated Knowledge</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Curated materials spanning current affairs, history, science, technology, analysis, and education.</p>
          </div>

        </div>

      </div>
    </section>
  );
};
