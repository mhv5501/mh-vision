import React, { useState } from 'react';
import { PdfCard } from './PdfCard';
import { getPdfCoverUrl } from '../services/cloudinary';
import { 
  ArrowLeft, 
  Share2, 
  IndianRupee, 
  ShoppingCart, 
  Download, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';

export const ProductDetailPage = ({ product, allProducts, onBuy, onBack, onSelectProduct }) => {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const isFree = product.price === 0 || Number(product.price) === 0;
  const coverUrl = getPdfCoverUrl(product.pdfUrl, product.coverUrl);
  const bundleCount = product.bundleFiles?.length || 1;
  const mediaType = product.mediaType || 'pdf';

  // Filter suggested products (same category first, excluding current product)
  const otherProducts = allProducts.filter(p => p.id !== product.id);
  const sameCategoryProducts = otherProducts.filter(p => p.category === product.category);
  const differentCategoryProducts = otherProducts.filter(p => p.category !== product.category);
  
  const suggestedProducts = [...sameCategoryProducts, ...differentCategoryProducts].slice(0, 4);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      alert(`Shareable Product Link:\n${shareUrl}`);
    }
  };

  const renderBadge = () => {
    if (product.isBundle) {
      return (
        <span className="inline-flex items-center space-x-1 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md">
          <Layers className="w-4 h-4 text-indigo-200" />
          <span>BUNDLE PACKAGE ({bundleCount} Files)</span>
        </span>
      );
    }
    if (mediaType === 'video') {
      return (
        <span className="inline-flex items-center space-x-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md">
          <Video className="w-4 h-4 text-purple-200" />
          <span>VIDEO MASTERCLASS</span>
        </span>
      );
    }
    if (mediaType === 'image') {
      return (
        <span className="inline-flex items-center space-x-1 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md">
          <ImageIcon className="w-4 h-4 text-emerald-200" />
          <span>PHOTO & GRAPHIC</span>
        </span>
      );
    }
    if (isFree) {
      return (
        <span className="inline-flex items-center space-x-1 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md">
          <Download className="w-4 h-4" />
          <span>FREE PDF GUIDE</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 bg-sky-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md">
        <FileText className="w-4 h-4 text-sky-200" />
        <span>PREMIUM PDF DOCUMENT</span>
      </span>
    );
  };

  return (
    <div className="space-y-12 animate-fadeIn py-4">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-sky-600 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            copied 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'bg-sky-50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-slate-800 hover:bg-sky-100'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share Product Link</span>
            </>
          )}
        </button>
      </div>

      {/* Main Product Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: High-Res Cover Preview */}
        <div className="md:col-span-5 relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md">
          <img
            src={coverUrl}
            alt={product.title}
            onError={(e) => { e.target.src = '/logo.jpg'; }}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            {renderBadge()}
          </div>
          {product.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-slate-900/80 text-sky-300 text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide backdrop-blur-sm">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="md:col-span-7 space-y-6">
          
          <div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold border border-sky-200 dark:border-sky-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>MH VISION Official Digital Media</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Pricing Banner */}
          <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Instant Access Price</span>
              <div className="flex items-center text-slate-900 dark:text-sky-400 font-extrabold text-2xl sm:text-3xl">
                <IndianRupee className="w-6 h-6 stroke-[2.5] mr-1" />
                <span>{isFree ? 'FREE DOWNLOAD' : product.price}</span>
              </div>
            </div>

            <button
              onClick={() => onBuy(product)}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-105 flex items-center space-x-2"
            >
              {product.isBundle ? (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Buy Bundle & Download</span>
                </>
              ) : isFree ? (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Now</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy & Download</span>
                </>
              )}
            </button>
          </div>

          {/* Description Section */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Product Overview</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {product.description || 'No detailed description provided for this product.'}
            </div>
          </div>

          {/* Bundle Items List (If Bundle) */}
          {product.isBundle && product.bundleFiles?.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Included Files in this Bundle ({product.bundleFiles.length})</span>
              </h3>
              <div className="space-y-2">
                {product.bundleFiles.map((file, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {idx + 1}. {file.name || `File ${idx + 1}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {file.mediaType || 'Media'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Guarantee */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <div className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <span>Instant Device Download</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <span>No Sign-up / Login Required</span>
            </div>
          </div>

        </div>
      </div>

      {/* Suggested Products Section ("You Might Also Like") */}
      {suggestedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              You Might Also Like
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {suggestedProducts.map((suggestedPdf) => (
              <PdfCard
                key={suggestedPdf.id}
                pdf={suggestedPdf}
                onBuy={onBuy}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
