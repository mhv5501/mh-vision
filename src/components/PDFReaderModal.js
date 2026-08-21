import { getCloudinaryPageUrl } from '../services/cloudinary.js';

export function renderPDFReaderModal(doc, state) {
  if (!doc) return '';

  const isCloudinaryPdf = Boolean(doc.publicId || (doc.pdfUrl && doc.pdfUrl.includes('cloudinary.com')));
  const currentPageNum = state.readerCurrentPage || 1;
  const totalPages = doc.pages || (state.pdfTotalPages || 1);

  // Generate Cloudinary page image URL
  const publicId = doc.publicId || (doc.pdfUrl ? doc.pdfUrl.split('/').pop().replace(/\.[^/.]+$/, "") : '');
  const activePageImageUrl = isCloudinaryPdf ? getCloudinaryPageUrl(publicId, currentPageNum) : '';

  const currentPageData = (!isCloudinaryPdf && doc.pagesContent && doc.pagesContent[currentPageNum - 1]) || {
    pageNumber: 1,
    chapter: 'PAGE 1',
    title: doc.title,
    content: `<div class="p-8 text-center font-serif"><p class="text-lg">${doc.abstract || 'Document loaded successfully.'}</p></div>`
  };

  const currentTheme = state.readerTheme || 'paper'; // paper, sepia, dark, oled
  const currentZoom = state.readerZoom || 100; // 75, 100, 125, 150
  const isTocOpen = state.isReaderTocOpen !== undefined ? state.isReaderTocOpen : false;

  const themeClasses = {
    paper: 'bg-[#FAF9F6] text-[#1A1A1A]',
    sepia: 'bg-[#F6EEDF] text-[#382A1B]',
    dark: 'bg-[#18181B] text-[#E4E4E7]',
    oled: 'bg-[#000000] text-[#D4D4D8]',
  };

  const themeNavClasses = {
    paper: 'bg-white/95 border-neutral-200 text-neutral-800',
    sepia: 'bg-[#EFE6D5]/95 border-[#D8C7B0] text-[#382A1B]',
    dark: 'bg-[#202024]/95 border-neutral-800 text-neutral-200',
    oled: 'bg-[#0E0E10]/95 border-neutral-900 text-neutral-200',
  };

  return `
    <div id="pdf-reader-modal" class="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-lg select-none transition-opacity duration-300" oncontextmenu="return false;">
      
      <!-- Security Shield Overlay (Triggered on PrintScreen / Unfocus / Snip attempt) -->
      <div id="reader-security-shield" class="fixed inset-0 z-[100] hidden bg-neutral-950/95 flex-col items-center justify-center p-8 text-center backdrop-blur-3xl transition-opacity duration-200">
        <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 animate-pulse">
          <i data-lucide="shield-alert" class="w-8 h-8"></i>
        </div>
        <h3 class="font-serif font-bold text-xl text-white mb-2">Protected Publication</h3>
        <p class="text-xs text-neutral-400 max-w-sm font-sans mb-4">
          Screenshots, screen recording, and unauthorized copying are disabled for MH VISION publications.
        </p>
        <span class="text-[11px] font-mono px-3 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
          Click window to resume reading
        </span>
      </div>

      <!-- Top Reader Toolbar -->
      <header class="h-16 px-3 sm:px-6 flex items-center justify-between border-b transition-colors z-30 ${themeNavClasses[currentTheme]}">
        
        <!-- Left: Back / Title / TOC Toggle -->
        <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button id="reader-close-btn" class="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0" title="Close Reader">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
          </button>
          
          <button id="reader-toc-toggle-btn" class="p-1.5 sm:p-2 rounded-lg ${isTocOpen ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:bg-black/10 dark:hover:bg-white/10'} transition-colors flex items-center space-x-1.5 text-xs font-mono flex-shrink-0" title="Page Navigation">
            <i data-lucide="menu" class="w-4 h-4"></i>
            <span class="hidden xs:inline">Pages</span>
          </button>

          <div class="h-5 w-px bg-neutral-300 dark:bg-neutral-700 hidden sm:block"></div>

          <div class="max-w-[120px] xs:max-w-[180px] sm:max-w-md truncate">
            <h3 class="font-serif font-bold text-xs sm:text-sm truncate leading-tight">${doc.title}</h3>
            <p class="text-[10px] sm:text-[11px] font-mono opacity-60 truncate">${doc.author}</p>
          </div>
        </div>

        <!-- Center: Page Nav & Zoom Controls -->
        <div class="flex items-center space-x-1 sm:space-x-3">
          
          <!-- Prev Page -->
          <button id="reader-prev-page-btn" ${currentPageNum <= 1 ? 'disabled' : ''} class="p-1 sm:p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Previous Page (←)">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>

          <!-- Page Indicator -->
          <div class="flex items-center space-x-1 text-[11px] sm:text-xs font-mono px-2 py-0.5 sm:py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <span class="font-bold">${currentPageNum}</span>
            <span class="opacity-50">/</span>
            <span id="reader-total-pages-display">${totalPages}</span>
          </div>

          <!-- Next Page -->
          <button id="reader-next-page-btn" ${currentPageNum >= totalPages ? 'disabled' : ''} class="p-1 sm:p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Next Page (→)">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>

          <div class="h-4 w-px bg-neutral-300 dark:bg-neutral-700 hidden md:block"></div>

          <!-- Zoom Controls -->
          <div class="hidden md:flex items-center space-x-1">
            <button id="reader-zoom-out-btn" class="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Zoom Out">
              <i data-lucide="zoom-out" class="w-4 h-4"></i>
            </button>
            <span class="text-[11px] font-mono px-1 min-w-[40px] text-center">${currentZoom}%</span>
            <button id="reader-zoom-in-btn" class="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Zoom In">
              <i data-lucide="zoom-in" class="w-4 h-4"></i>
            </button>
          </div>

        </div>

        <!-- Right: Reading Themes & DRM Security Badge -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          
          <!-- Theme Picker Pills -->
          <div class="flex items-center space-x-0.5 sm:space-x-1 p-0.5 sm:p-1 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] sm:text-[11px]">
            <button class="reader-theme-btn px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-mono ${currentTheme === 'paper' ? 'bg-white shadow-xs font-bold text-black' : 'opacity-60 hover:opacity-100'}" data-theme="paper">Paper</button>
            <button class="reader-theme-btn px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-mono ${currentTheme === 'sepia' ? 'bg-[#F6EEDF] shadow-xs font-bold text-[#382A1B]' : 'opacity-60 hover:opacity-100'}" data-theme="sepia">Sepia</button>
            <button class="reader-theme-btn px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-mono ${currentTheme === 'dark' ? 'bg-[#18181B] shadow-xs font-bold text-white' : 'opacity-60 hover:opacity-100'}" data-theme="dark">Dark</button>
            <button class="reader-theme-btn px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-mono ${currentTheme === 'oled' ? 'bg-black shadow-xs font-bold text-white' : 'opacity-60 hover:opacity-100'}" data-theme="oled">OLED</button>
          </div>

        </div>

      </header>

      <!-- Main Reader Body (Left TOC + Central Protected Reading Canvas) -->
      <div id="reader-content-wrapper" class="flex-1 flex overflow-hidden relative select-none">
        
        <!-- Mobile TOC Backdrop Overlay -->
        ${isTocOpen ? `
          <div id="reader-toc-backdrop" class="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-xs"></div>
        ` : ''}

        <!-- Left Table of Contents / Thumbnails Drawer -->
        ${isTocOpen ? `
          <aside class="fixed md:static inset-y-0 left-0 z-40 w-72 flex-shrink-0 border-r flex flex-col p-4 overflow-y-auto select-none shadow-2xl md:shadow-none transition-transform duration-300 ${themeNavClasses[currentTheme]}">
            <div class="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <span class="text-xs font-mono uppercase tracking-widest font-bold">Document Navigation</span>
              <button onclick="window.handleToggleReaderToc()" class="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white md:hidden">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Page Thumbnails Strip -->
            <div class="space-y-2 flex-1 overflow-y-auto">
              <span class="text-[10px] font-mono uppercase tracking-wider block mb-2 opacity-60">Visual Page Jumper</span>
              <div class="grid grid-cols-2 gap-2">
                ${Array.from({ length: Math.min(totalPages, 50) }).map((_, idx) => {
                  const pNum = idx + 1;
                  const thumbUrl = isCloudinaryPdf ? getCloudinaryPageUrl(publicId, pNum) : '';
                  return `
                    <button class="reader-thumb-btn p-1.5 rounded-lg border text-left aspect-[3/4] flex flex-col justify-between transition-all overflow-hidden relative group select-none ${
                      currentPageNum === pNum 
                        ? 'border-amber-600 ring-2 ring-amber-600/40 font-bold bg-amber-500/10 text-amber-900 dark:text-amber-300' 
                        : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 opacity-80'
                    }" data-page="${pNum}">
                      ${thumbUrl ? `
                        <img src="${thumbUrl}" alt="Page ${pNum}" draggable="false" class="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform pointer-events-none" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                        <span class="relative z-10 text-[9px] font-mono font-bold text-white bg-black/60 px-1 py-0.5 rounded">P.${pNum}</span>
                      ` : `
                        <span class="text-[9px] font-mono font-bold">Page ${pNum}</span>
                        <div class="space-y-0.5 opacity-40">
                          <div class="h-1 bg-current rounded w-full"></div>
                          <div class="h-1 bg-current rounded w-4/5"></div>
                          <div class="h-1 bg-current rounded w-3/5"></div>
                        </div>
                        <span class="text-[8px] font-mono opacity-50 truncate">Page ${pNum}</span>
                      `}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

          </aside>
        ` : ''}

        <!-- Central High-Res Protected Reading Canvas -->
        <main id="pdf-canvas-container" class="flex-1 w-full h-full overflow-y-auto p-2 sm:p-6 md:p-8 flex flex-col items-center justify-start bg-neutral-900/80 custom-reader-canvas select-none relative">
          
          ${isCloudinaryPdf ? `
            <!-- HIGH-RES CLOUDINARY VECTOR PAGE VIEWER (Protected) -->
            <div class="relative flex flex-col items-center w-full max-w-3xl my-auto transition-transform duration-200 select-none" style="transform: scale(${currentZoom / 100}); transform-origin: top center;">
              
              <!-- Container with Anti-Piracy Watermark & Protection Layer -->
              <div class="relative w-full max-w-3xl min-h-[450px] sm:min-h-[600px] flex items-center justify-center select-none">
                
                <!-- Transparent Click-Jack / Save Prevention Overlay -->
                <div class="absolute inset-0 z-20 bg-transparent select-none cursor-default" oncontextmenu="return false;"></div>

                <!-- Forensic Security Watermark Overlay -->
                <div class="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none opacity-[0.07] flex flex-wrap items-center justify-around rotate-[-25deg] gap-8 p-4 sm:p-8 font-mono text-[10px] sm:text-xs font-black uppercase text-black dark:text-white">
                  <span>MH VISION · LICENSED COPY</span>
                  <span>CONFIDENTIAL · DO NOT LEAK</span>
                  <span>MH VISION · OFFICIAL PUBLICATION</span>
                  <span>VERIFIED SCHOLAR ACCESS</span>
                </div>

                <!-- Real Page Image View -->
                <img 
                  id="reader-page-image"
                  src="${activePageImageUrl}" 
                  alt="Page ${currentPageNum} of ${doc.title}"
                  draggable="false"
                  class="w-full max-w-3xl rounded-xl shadow-2xl bg-white border border-neutral-700/50 select-none pointer-events-none object-contain max-h-[82vh]"
                  onload="const sp = document.getElementById('page-loading-spinner'); if (sp) sp.style.display = 'none';"
                  onerror="this.classList.add('hidden'); const err = document.getElementById('page-load-error'); if (err) err.classList.remove('hidden');"
                />

                <!-- Loading Spinner -->
                <div id="page-loading-spinner" class="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 rounded-xl space-y-3 p-8 text-white z-0">
                  <div class="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p class="text-xs font-mono text-amber-400">Loading Page ${currentPageNum} of ${totalPages}...</p>
                </div>

                <!-- Error Fallback (if any) -->
                <div id="page-load-error" class="hidden p-8 rounded-2xl bg-[#18181B] border border-neutral-700 text-center space-y-3 max-w-md text-white z-30">
                  <div class="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <i data-lucide="file-text" class="w-6 h-6"></i>
                  </div>
                  <h4 class="font-serif font-bold text-base">Publication Ready</h4>
                  <p class="text-xs text-neutral-400">
                    Document is securely synchronized with MH VISION storage.
                  </p>
                </div>
              </div>

              <!-- Running Footer -->
              <div class="mt-3 sm:mt-4 flex items-center justify-between w-full max-w-3xl text-[10px] sm:text-xs font-mono text-neutral-400 px-2 select-none">
                <span class="truncate pr-2">${doc.title}</span>
                <span class="whitespace-nowrap">Page ${currentPageNum} of ${totalPages}</span>
              </div>

            </div>
          ` : `
            <!-- Fallback Typography Sheet -->
            <article id="reader-page-sheet" 
                     class="relative w-full max-w-3xl min-h-[600px] sm:min-h-[900px] p-6 sm:p-14 md:p-16 rounded-xl shadow-2xl transition-all duration-200 select-none ${themeClasses[currentTheme]}"
                     style="transform: scale(${currentZoom / 100}); transform-origin: top center;">
              
              <!-- Watermark -->
              <div class="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none opacity-[0.05] flex flex-wrap items-center justify-around rotate-[-25deg] gap-12 p-8 font-mono text-xs font-black uppercase">
                <span>MH VISION · LICENSED COPY</span>
                <span>CONFIDENTIAL</span>
              </div>

              <div class="flex justify-between items-center text-[10px] sm:text-[11px] font-mono uppercase tracking-widest pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-black/10 dark:border-white/10 opacity-60">
                <span>MH VISION DIGITAL PUBLICATIONS</span>
                <span>${doc.edition || 'MALAYALAM KNOWLEDGE HUB'}</span>
              </div>

              <div class="text-center mb-8 sm:mb-10">
                <span class="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] opacity-60 block mb-2">
                  ${currentPageData.chapter || `SECTION ${currentPageNum}`}
                </span>
                <h1 class="text-xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight">
                  ${currentPageData.title}
                </h1>
                <div class="w-12 h-0.5 bg-amber-600 dark:bg-amber-400 mx-auto mt-4 opacity-70"></div>
              </div>

              <div class="reading-prose space-y-4 sm:space-y-6 font-serif leading-relaxed text-sm sm:text-lg select-none">
                ${currentPageData.content}
              </div>

              <div class="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-[10px] sm:text-xs font-mono opacity-50">
                <span>${doc.title}</span>
                <span>Page ${currentPageNum} of ${totalPages} · DRM Protected</span>
              </div>

            </article>
          `}

        </main>

      </div>

    </div>
  `;
}
