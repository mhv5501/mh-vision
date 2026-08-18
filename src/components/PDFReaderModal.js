export function renderPDFReaderModal(doc, state) {
  if (!doc) return '';

  const currentPageNum = state.readerCurrentPage || 1;
  const totalPages = doc.pagesContent ? doc.pagesContent.length : (doc.pages || 1);
  const currentPageData = (doc.pagesContent && doc.pagesContent[currentPageNum - 1]) || {
    pageNumber: 1,
    chapter: 'PAGE 1',
    title: doc.title,
    content: `<div class="p-8 text-center font-serif"><p class="text-lg">${doc.abstract || 'Document loaded successfully.'}</p></div>`
  };

  const currentTheme = state.readerTheme || 'paper'; // paper, sepia, dark, oled
  const currentZoom = state.readerZoom || 100; // 75, 100, 125, 150
  const isTocOpen = state.isReaderTocOpen !== undefined ? state.isReaderTocOpen : true;
  const isAiOpen = state.isReaderAiOpen !== undefined ? state.isReaderAiOpen : false;

  const themeClasses = {
    paper: 'bg-[#FAF9F6] text-[#1A1A1A]',
    sepia: 'bg-[#F6EEDF] text-[#382A1B]',
    dark: 'bg-[#18181B] text-[#E4E4E7]',
    oled: 'bg-[#000000] text-[#D4D4D8]',
  };

  const themeNavClasses = {
    paper: 'bg-white/90 border-neutral-200 text-neutral-800',
    sepia: 'bg-[#EFE6D5]/90 border-[#D8C7B0] text-[#382A1B]',
    dark: 'bg-[#202024]/90 border-neutral-800 text-neutral-200',
    oled: 'bg-[#0E0E10]/90 border-neutral-900 text-neutral-200',
  };

  return `
    <div id="pdf-reader-modal" class="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-lg select-text transition-opacity duration-300">
      
      <!-- Top Reader Toolbar -->
      <header class="h-16 px-4 sm:px-6 flex items-center justify-between border-b transition-colors z-30 ${themeNavClasses[currentTheme]}">
        
        <!-- Left: Back / Title / TOC Toggle -->
        <div class="flex items-center space-x-3">
          <button id="reader-close-btn" class="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Close Reader">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
          </button>
          
          <button id="reader-toc-toggle-btn" class="p-2 rounded-lg ${isTocOpen ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:bg-black/10 dark:hover:bg-white/10'} transition-colors hidden sm:flex items-center space-x-1.5 text-xs font-mono" title="Table of Contents">
            <i data-lucide="menu" class="w-4 h-4"></i>
            <span>Contents</span>
          </button>

          <div class="h-5 w-px bg-neutral-300 dark:bg-neutral-700 hidden sm:block"></div>

          <div class="max-w-xs sm:max-w-md truncate">
            <h3 class="font-serif font-bold text-sm truncate leading-tight">${doc.title}</h3>
            <p class="text-[11px] font-mono opacity-60 truncate">${doc.edition || 'Official Edition'} · ${doc.author}</p>
          </div>
        </div>

        <!-- Center: Page Nav & Zoom Controls -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          
          <!-- Prev Page -->
          <button id="reader-prev-page-btn" ${currentPageNum <= 1 ? 'disabled' : ''} class="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Previous Page (←)">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>

          <!-- Page Indicator -->
          <div class="flex items-center space-x-1 text-xs font-mono px-2 py-1 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <span class="font-bold">${currentPageNum}</span>
            <span class="opacity-50">/</span>
            <span>${totalPages}</span>
          </div>

          <!-- Next Page -->
          <button id="reader-next-page-btn" ${currentPageNum >= totalPages ? 'disabled' : ''} class="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Next Page (→)">
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

        <!-- Right: Reading Themes / AI Summary -->
        <div class="flex items-center space-x-2">
          
          <!-- Theme Picker Pills -->
          <div class="hidden lg:flex items-center space-x-1 p-1 rounded-lg bg-black/5 dark:bg-white/5">
            <button class="reader-theme-btn px-2 py-1 rounded text-[11px] font-mono ${currentTheme === 'paper' ? 'bg-white shadow-xs font-bold text-black' : 'opacity-60 hover:opacity-100'}" data-theme="paper">Paper</button>
            <button class="reader-theme-btn px-2 py-1 rounded text-[11px] font-mono ${currentTheme === 'sepia' ? 'bg-[#F6EEDF] shadow-xs font-bold text-[#382A1B]' : 'opacity-60 hover:opacity-100'}" data-theme="sepia">Sepia</button>
            <button class="reader-theme-btn px-2 py-1 rounded text-[11px] font-mono ${currentTheme === 'dark' ? 'bg-[#18181B] shadow-xs font-bold text-white' : 'opacity-60 hover:opacity-100'}" data-theme="dark">Dark</button>
            <button class="reader-theme-btn px-2 py-1 rounded text-[11px] font-mono ${currentTheme === 'oled' ? 'bg-black shadow-xs font-bold text-white' : 'opacity-60 hover:opacity-100'}" data-theme="oled">OLED</button>
          </div>

          <!-- AI Assistant Toggle -->
          <button id="reader-ai-toggle-btn" class="p-2 rounded-lg ${isAiOpen ? 'bg-amber-500 text-white font-bold' : 'hover:bg-black/10 dark:hover:bg-white/10 text-amber-500'} transition-colors flex items-center space-x-1 text-xs" title="AI Summary & Insights">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            <span class="hidden sm:inline">AI Summary</span>
          </button>
        </div>

      </header>

      <!-- Main Reader Body (Left TOC + Reading Canvas + Right AI Drawer) -->
      <div class="flex-1 flex overflow-hidden relative">
        
        <!-- Left Table of Contents Drawer -->
        ${isTocOpen ? `
          <aside class="w-64 md:w-72 flex-shrink-0 border-r flex flex-col p-4 overflow-y-auto z-20 ${themeNavClasses[currentTheme]}">
            <div class="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <span class="text-xs font-mono uppercase tracking-widest font-bold">Document Map</span>
              <span class="text-[10px] font-mono opacity-60">${totalPages} Chapters</span>
            </div>

            <!-- TOC List -->
            <div class="space-y-1.5">
              ${(doc.tableOfContents || []).map(item => `
                <button class="reader-toc-item w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  currentPageNum === item.page 
                    ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border-l-2 border-amber-600' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
                }" data-page="${item.page}">
                  <span class="truncate pr-2">${item.title}</span>
                  <span class="text-[10px] font-mono opacity-50 flex-shrink-0">p.${item.page}</span>
                </button>
              `).join('')}
            </div>

            <!-- Page Thumbnails Strip -->
            <div class="mt-8 pt-4 border-t border-black/10 dark:border-white/10">
              <span class="text-[10px] font-mono uppercase tracking-wider block mb-3 opacity-60">Visual Thumbnails</span>
              <div class="grid grid-cols-2 gap-2">
                ${Array.from({ length: Math.min(totalPages, 12) }).map((_, idx) => {
                  const pNum = idx + 1;
                  return `
                    <button class="reader-thumb-btn p-2 rounded border text-left aspect-[3/4] flex flex-col justify-between transition-all ${
                      currentPageNum === pNum 
                        ? 'border-amber-600 ring-2 ring-amber-600/30 font-bold bg-amber-500/10' 
                        : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 opacity-70'
                    }" data-page="${pNum}">
                      <span class="text-[9px] font-mono">P.${pNum}</span>
                      <div class="space-y-0.5 opacity-40">
                        <div class="h-1 bg-current rounded w-full"></div>
                        <div class="h-1 bg-current rounded w-4/5"></div>
                        <div class="h-1 bg-current rounded w-3/5"></div>
                      </div>
                      <span class="text-[8px] font-mono opacity-50 truncate">Ch. ${pNum}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

          </aside>
        ` : ''}

        <!-- Central High-Res Reading Canvas -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 flex justify-center items-start bg-neutral-900/60 custom-reader-canvas">
          
          <!-- Virtual Page Sheet with Zoom -->
          <article id="reader-page-sheet" 
                   class="relative w-full max-w-3xl min-h-[900px] p-8 sm:p-14 md:p-16 rounded-xl shadow-2xl transition-all duration-200 ${themeClasses[currentTheme]}"
                   style="transform: scale(${currentZoom / 100}); transform-origin: top center;">
            
            <!-- Top Running Header -->
            <div class="flex justify-between items-center text-[11px] font-mono uppercase tracking-widest pb-6 mb-8 border-b border-black/10 dark:border-white/10 opacity-60">
              <span>MH VISION DIGITAL PUBLICATIONS</span>
              <span>${doc.edition || 'MALAYALAM KNOWLEDGE HUB'}</span>
            </div>

            <!-- Chapter & Title -->
            <div class="text-center mb-10">
              <span class="text-xs font-mono uppercase tracking-[0.3em] opacity-60 block mb-2">
                ${currentPageData.chapter || `SECTION ${currentPageNum}`}
              </span>
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight">
                ${currentPageData.title}
              </h1>
              <div class="w-12 h-0.5 bg-amber-600 dark:bg-amber-400 mx-auto mt-4 opacity-70"></div>
            </div>

            <!-- Cloudinary Cloud Stream Indicator (if real PDF attached) -->
            ${doc.pdfUrl ? `
              <div class="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <div class="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
                  <i data-lucide="cloud-check" class="w-4 h-4 text-emerald-500"></i>
                  <span>Cloudinary CDN Stream Verified</span>
                </div>
                <span class="text-[10px] opacity-70">WASM Secure Stream</span>
              </div>
            ` : ''}

            <!-- Rendered Page Content -->
            <div class="reading-prose space-y-6 font-serif leading-relaxed text-base sm:text-lg">
              ${currentPageData.content}
            </div>

            <!-- Running Footer & Page Number -->
            <div class="mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-xs font-mono opacity-50">
              <span>${doc.title}</span>
              <span>Page ${currentPageNum} of ${totalPages}</span>
            </div>

          </article>

        </main>

        <!-- Right AI Summary & Notes Drawer -->
        ${isAiOpen ? `
          <aside class="w-72 md:w-80 flex-shrink-0 border-l flex flex-col p-5 overflow-y-auto z-20 ${themeNavClasses[currentTheme]}">
            
            <div class="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <div class="flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-500">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                <span class="uppercase">AI Synthesis & Notes</span>
              </div>
              <button id="reader-close-ai-btn" class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Key Takeaways for this page -->
            <div class="space-y-4">
              
              <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 mb-2">
                  Key Insights (Page ${currentPageNum})
                </h4>
                <p class="text-xs font-sans leading-relaxed">
                  ${doc.highlights ? doc.highlights[currentPageNum - 1] || doc.highlights[0] : 'Comprehensive educational insights curated for Malayalam Knowledge Hub learners.'}
                </p>
              </div>

              <!-- Key Concepts -->
              <div>
                <h5 class="text-[11px] font-mono uppercase tracking-wider opacity-60 mb-2">Core Topics</h5>
                <div class="flex flex-wrap gap-1.5">
                  <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">#MHVision</span>
                  <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">#KnowledgeHub</span>
                  <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono">#KeralaEducation</span>
                </div>
              </div>

              <!-- Scholar Notes Scratchpad (Autosaved) -->
              <div class="pt-4 border-t border-black/10 dark:border-white/10">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono font-bold uppercase">Scholar Notes</span>
                  <span id="notes-save-status" class="text-[10px] font-mono text-emerald-500">Autosaved</span>
                </div>
                <textarea 
                  id="reader-notes-input" 
                  rows="6" 
                  placeholder="Record your notes, citations, or formulas here..." 
                  class="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none">${state.docNotes && state.docNotes[doc.id] ? state.docNotes[doc.id] : ''}</textarea>
              </div>

            </div>

          </aside>
        ` : ''}

      </div>

    </div>
  `;
}
