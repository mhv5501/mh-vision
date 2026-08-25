import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-sky-200/80 dark:border-slate-800 py-10 mt-auto transition-colors">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        
        {/* Brand Info (Centered) */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.jpg" alt="MH VISION" className="h-9 w-9 rounded-full border border-sky-500 shadow-xs" />
            <span className="font-black text-xl tracking-wide text-slate-900 dark:text-sky-400">MH VISION</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            Malayalam Knowledge Hub — Empowering minds through knowledge, awareness, and growth.
          </p>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-1.5 rounded-full font-medium shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>100% Secure Razorpay Payments (₹) & Cloud Encrypted PDF Storage</span>
        </div>

        {/* Bottom Bar: Copyright & "created by RUWAISHID M" */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MH VISION. All rights reserved.</p>
          
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

          <button
            onClick={onOpenAdmin}
            title="Admin Login & Control Panel (Password: admin123)"
            className="group inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-semibold cursor-pointer"
          >
            <span>created by</span>
            <span className="font-extrabold tracking-wider text-sky-600 dark:text-sky-400 group-hover:underline uppercase">
              RUWAISHID M
            </span>
          </button>
        </div>

      </div>
    </footer>
  );
};
