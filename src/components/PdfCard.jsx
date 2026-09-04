import React from 'react';
import { getPdfCoverUrl } from '../services/cloudinary';
import { Download, ShoppingCart, IndianRupee, Sparkles, Layers, Video, Image as ImageIcon, FileText } from 'lucide-react';

export const PdfCard = ({ pdf, onBuy }) => {
  const isFree = pdf.price === 0 || Number(pdf.price) === 0;
  const coverUrl = getPdfCoverUrl(pdf.pdfUrl, pdf.coverUrl);
  const bundleCount = pdf.bundleFiles?.length || 1;
  const mediaType = pdf.mediaType || 'pdf';

  const renderBadge = () => {
    if (pdf.isBundle) {
      return (
        <span className="inline-flex items-center space-x-1 bg-indigo-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold shadow-md backdrop-blur-sm">
          <Layers className="w-3 h-3 text-indigo-200" />
          <span>BUNDLE ({bundleCount} Files)</span>
        </span>
      );
    }
    if (mediaType === 'video') {
      return (
        <span className="inline-flex items-center space-x-1 bg-purple-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold shadow-md backdrop-blur-sm">
          <Video className="w-3 h-3 text-purple-200" />
          <span>VIDEO</span>
        </span>
      );
    }
    if (mediaType === 'image') {
      return (
        <span className="inline-flex items-center space-x-1 bg-emerald-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold shadow-md backdrop-blur-sm">
          <ImageIcon className="w-3 h-3 text-emerald-200" />
          <span>PHOTO</span>
        </span>
      );
    }
    if (isFree) {
      return (
        <span className="inline-flex items-center space-x-1 bg-emerald-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold shadow-md backdrop-blur-sm">
          <Download className="w-3 h-3" />
          <span>FREE PDF</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 bg-sky-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold shadow-md backdrop-blur-sm">
        <FileText className="w-3 h-3 text-sky-200" />
        <span>PDF</span>
      </span>
    );
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-sky-400 transition-all duration-300 flex flex-col h-full">
      
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <img
          src={coverUrl}
          alt={pdf.title}
          onError={(e) => { e.target.src = '/logo.jpg'; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Format Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {renderBadge()}
        </div>

        {/* Category Tag */}
        {pdf.category && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-slate-900/80 text-sky-300 text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide backdrop-blur-sm">
              {pdf.category}
            </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-2 mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {pdf.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3">
            {pdf.description || 'No description provided.'}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto gap-2">
          
          {/* Price display in INR ₹ */}
          <div className="flex items-center text-slate-900 dark:text-sky-400 font-extrabold text-base sm:text-lg">
            <IndianRupee className="w-4 h-4 mr-0.5 stroke-[2.5]" />
            <span>{isFree ? 'FREE' : pdf.price}</span>
          </div>

          {/* Action Button: Buy & Download */}
          <button
            onClick={() => onBuy(pdf)}
            className="flex-1 max-w-[150px] flex items-center justify-center space-x-1 py-2 px-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
          >
            {pdf.isBundle ? (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>Buy Bundle</span>
              </>
            ) : isFree ? (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Buy & Download</span>
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};
