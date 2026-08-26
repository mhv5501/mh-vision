import React, { useState } from 'react';
import { PdfCard } from './PdfCard';
import { Search, BookOpen, Sparkles } from 'lucide-react';

export const PdfGrid = ({ pdfs, onBuy }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(pdfs.map(p => p.category).filter(Boolean))];

  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pdf.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || pdf.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="collection" className="py-10 sm:py-16 scroll-mt-24">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-sky-500" />
            <span>PDF Collection</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Buy once & instantly download watermarked PDF guides directly to your device
          </p>
        </div>

        {/* Search Input & Category Dropdown */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search PDFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-colors shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-sky-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Responsive Grid: 2 COLUMNS ON MOBILE (grid-cols-2) */}
      {filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredPdfs.map((pdf) => (
            <PdfCard
              key={pdf.id}
              pdf={pdf}
              onBuy={onBuy}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-sky-200 dark:border-slate-800 p-8">
          <Sparkles className="w-12 h-12 text-sky-500 mx-auto mb-3 opacity-60 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No PDFs Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try clearing your search filters to view available PDFs.' 
              : 'The collection is empty. New PDFs will be uploaded soon by the admin!'}
          </p>
        </div>
      )}

    </section>
  );
};
