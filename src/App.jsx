import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PdfGrid } from './components/PdfGrid';
import { PdfReaderModal } from './components/PdfReaderModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { AboutSection } from './components/AboutSection';
import { useAuth } from './context/AuthContext';
import { subscribeToPdfs } from './services/pdfStore';
import { openRazorpayPayment } from './services/razorpay';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  const [pdfs, setPdfs] = useState([]);
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedReaderPdf, setSelectedReaderPdf] = useState(null);

  // Pending purchase PDF after authentication
  const [pendingPurchasePdf, setPendingPurchasePdf] = useState(null);

  const { currentUser, isPdfUnlocked } = useAuth();

  // Real-time Firestore PDF subscription
  useEffect(() => {
    const unsub = subscribeToPdfs((pdfList) => {
      if (pdfList.length > 0) {
        setPdfs(pdfList);
      } else {
        // Sample default PDFs for initial demonstration
        setPdfs([
          {
            id: 'sample-1',
            title: 'Malayalam Knowledge Hub - Current Affairs 2026',
            description: 'Comprehensive guide covering national news, analysis, science & technology updates in Malayalam.',
            price: 49,
            category: 'Current Affairs',
            pdfUrl: 'https://pdfobject.com/pdf/sample.pdf',
            coverUrl: '',
            createdAt: new Date().toISOString()
          },
          {
            id: 'sample-2',
            title: 'Science & Technology Innovation Notes',
            description: 'In-depth notes on latest breakthroughs, space missions, and AI advancements.',
            price: 99,
            category: 'Science & Tech',
            pdfUrl: 'https://pdfobject.com/pdf/sample.pdf',
            coverUrl: '',
            createdAt: new Date().toISOString()
          },
          {
            id: 'sample-3',
            title: 'Kerala History & Culture Overview',
            description: 'Free introductory guide to Kerala historical milestones and cultural heritage.',
            price: 0,
            category: 'History',
            pdfUrl: 'https://pdfobject.com/pdf/sample.pdf',
            coverUrl: '',
            createdAt: new Date().toISOString()
          }
        ]);
      }
    });

    return () => unsub();
  }, []);

  // Handle PDF Purchase Click
  const handleBuyPdf = (pdf) => {
    if (!currentUser) {
      setPendingPurchasePdf(pdf);
      setIsAuthOpen(true);
      return;
    }

    openRazorpayPayment({
      pdf,
      user: currentUser,
      onSuccess: ({ pdf: purchasedPdf }) => {
        alert(`🎉 Purchase Successful! "${purchasedPdf.title}" is now unlocked for your account across all devices.`);
        setSelectedReaderPdf(purchasedPdf);
      },
      onError: (err) => {
        if (!err.message?.includes('cancelled')) {
          alert(`Payment Notice: ${err.message || 'Transaction could not be completed.'}`);
        }
      }
    });
  };

  const handleAuthSuccess = () => {
    if (pendingPurchasePdf) {
      const pdfToBuy = pendingPurchasePdf;
      setPendingPurchasePdf(null);
      setTimeout(() => {
        handleBuyPdf(pdfToBuy);
      }, 400);
    }
  };

  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-400 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Single Page Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        
        {/* HERO BANNER SECTION (Clean White Background with Light Blue Accents) */}
        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-8 sm:p-14 shadow-lg shadow-sky-500/5">
          <div className="relative z-10 max-w-3xl space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold border border-sky-200 dark:border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Malayalam Knowledge Hub • MH VISION</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Think Smart, <span className="text-sky-600 dark:text-sky-400">Stay Ahead.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
              Unlock premium Malayalam PDF guides, current affairs, educational notes, and analysis. Purchase once and access seamlessly on any smartphone or computer logged into your account.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={scrollToCollection}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Browse PDFs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-sky-100/50 dark:bg-sky-900/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* PDF COLLECTION GRID */}
        <PdfGrid
          pdfs={pdfs}
          isUnlocked={isPdfUnlocked}
          onRead={(pdf) => setSelectedReaderPdf(pdf)}
          onBuy={handleBuyPdf}
        />

        {/* ABOUT SECTION */}
        <AboutSection />

      </main>

      {/* Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        pdfs={pdfs}
      />

      <PdfReaderModal
        pdf={selectedReaderPdf}
        isOpen={!!selectedReaderPdf}
        onClose={() => setSelectedReaderPdf(null)}
        userEmail={currentUser?.email}
      />

    </div>
  );
}
