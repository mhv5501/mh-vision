import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PdfGrid } from './components/PdfGrid';
import { AdminModal } from './components/AdminModal';
import { AboutSection } from './components/AboutSection';
import { subscribeToPdfs } from './services/pdfStore';
import { openRazorpayPayment } from './services/razorpay';
import { watermarkAndDownloadPdf } from './services/watermark';
import { Sparkles, ArrowRight, Download } from 'lucide-react';

export default function App() {
  const [pdfs, setPdfs] = useState([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

  // Real-time Firestore PDF subscription
  useEffect(() => {
    const unsub = subscribeToPdfs((pdfList) => {
      setPdfs(pdfList || []);
    });

    return () => unsub();
  }, []);

  // Direct Purchase & Instant Watermarked Download
  const handleBuyPdf = async (pdf) => {
    const isFree = pdf.price === 0 || Number(pdf.price) === 0;

    // Free PDF: Download immediately with watermark
    if (isFree) {
      setDownloadingPdfId(pdf.id);
      try {
        await watermarkAndDownloadPdf(pdf.pdfUrl, pdf.title);
      } catch (err) {
        console.error("Free download error:", err);
        alert("Failed to download PDF. Please try again.");
      } finally {
        setDownloadingPdfId(null);
      }
      return;
    }

    // Paid PDF: Launch Razorpay payment directly (bypassing prefill prompts)
    openRazorpayPayment({
      pdf,
      onSuccess: async ({ pdf: purchasedPdf }) => {
        setDownloadingPdfId(purchasedPdf.id);
        try {
          // Instant direct file download to customer device
          await watermarkAndDownloadPdf(purchasedPdf.pdfUrl, purchasedPdf.title);
          alert(`🎉 Payment Successful! "${purchasedPdf.title}" has been watermarked and downloaded to your device.`);
        } catch (err) {
          console.error("Post-payment download error:", err);
          alert("Payment received! Opening direct download URL.");
          window.open(purchasedPdf.pdfUrl, '_blank');
        } finally {
          setDownloadingPdfId(null);
        }
      },
      onError: (err) => {
        if (!err.message?.includes('cancelled')) {
          alert(`Payment Notice: ${err.message || 'Transaction could not be completed.'}`);
        }
      }
    });
  };

  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-400 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Single Page Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        
        {/* Downloading Overlay Loading Toast */}
        {downloadingPdfId && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-500/30 flex items-center space-x-3 animate-bounce">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-400 border-t-transparent" />
            <span className="text-xs font-bold">Embedding MH VISION Watermark & Downloading PDF...</span>
          </div>
        )}

        {/* HERO BANNER SECTION */}
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
              Buy & instantly download watermarked Malayalam PDF guides, notes, current affairs, and educational materials straight to your smartphone or desktop. No sign-up required.
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
          onBuy={handleBuyPdf}
        />

        {/* ABOUT SECTION */}
        <AboutSection />

      </main>

      {/* Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        pdfs={pdfs}
      />

    </div>
  );
}
