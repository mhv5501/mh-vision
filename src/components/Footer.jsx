import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-12 mt-auto transition-colors shadow-inner">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        
        {/* Brand Info (Centered) */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.jpg" alt="MH VISION" className="h-9 w-9 rounded-full border border-sky-400 shadow-md" />
            <span className="font-black text-xl tracking-wide text-white">MH VISION</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Malayalam Knowledge Hub — Empowering minds through knowledge, awareness, and growth.
          </p>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-4 py-1.5 rounded-full font-medium shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Secure Razorpay Payments (₹) & Cloud Encrypted PDF Storage</span>
        </div>

        {/* Bottom Bar: Copyright & "created by RUWAISHID M" */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MH VISION. All rights reserved.</p>
          
          <span className="hidden sm:inline text-slate-700">•</span>

          <button
            onClick={onOpenAdmin}
            title="Admin Login & Control Panel (Password: admin123)"
            className="group inline-flex items-center space-x-1.5 text-slate-400 hover:text-sky-400 transition-colors font-semibold cursor-pointer"
          >
            <span>created by</span>
            <span className="font-extrabold tracking-wider text-sky-400 group-hover:underline uppercase">
              RUWAISHID M
            </span>
          </button>
        </div>

      </div>
    </footer>
  );
};
