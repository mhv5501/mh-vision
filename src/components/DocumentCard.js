export function renderDocumentCard(doc, isUnlocked) {
  return `
    <div class="group relative flex flex-col bg-white dark:bg-[#141416] rounded-xl border border-neutral-200/90 dark:border-neutral-800 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
         onclick="window.handleOpenDocument('${doc.id}')">
      
      <!-- Card Image / PDF Cover Graphic representation -->
      <div class="relative w-full aspect-[3/4] rounded-lg overflow-hidden flex flex-col justify-between p-5 text-white transition-transform duration-500 group-hover:scale-[1.02] shadow-sm"
           style="background: ${doc.coverStyle};">
        
        <!-- Subtle book spine left accent -->
        <div class="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-white/25 via-black/20 to-transparent pointer-events-none"></div>

        <!-- Top Card Meta -->
        <div class="flex justify-between items-start z-10">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/40 backdrop-blur-sm text-neutral-300">
            ${doc.pages}p · PDF
          </span>
          <span class="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-neutral-900 transition-colors">
            <i data-lucide="${isUnlocked ? 'unlock' : 'lock'}" class="w-3 h-3"></i>
          </span>
        </div>

        <!-- Center Typography Art -->
        <div class="z-10 text-center my-auto py-2">
          <p class="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-mono mb-1">
            ${doc.category}
          </p>
          <h3 class="font-serif text-lg font-bold leading-snug line-clamp-3 text-white">
            ${doc.title}
          </h3>
          <p class="text-[11px] font-serif italic text-neutral-300 mt-1 line-clamp-1">
            by ${doc.author}
          </p>
        </div>

        <!-- Bottom Card Tag -->
        <div class="flex items-center justify-between z-10 pt-2 border-t border-white/10 text-[10px] font-mono text-neutral-300">
          <span class="flex items-center space-x-1">
            <i data-lucide="star" class="w-3 h-3 text-amber-400 fill-amber-400"></i>
            <span>${doc.rating}</span>
          </span>
          <span class="text-neutral-400 font-sans italic">${doc.readTime}</span>
        </div>

        <!-- Floating Quick Read Hover Overlay -->
        <div class="absolute inset-0 bg-neutral-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-20">
          <div class="w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center mb-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <i data-lucide="${isUnlocked ? 'book-open' : 'credit-card'}" class="w-4 h-4"></i>
          </div>
          <span class="text-xs font-bold uppercase tracking-wider text-white">
            ${isUnlocked ? 'Read PDF' : 'Unlock Access'}
          </span>
          <span class="text-[11px] text-amber-400 font-mono mt-1">
            ${isUnlocked ? 'Unlocked' : '₹' + doc.price + ' · Instant Read'}
          </span>
        </div>

      </div>

      <!-- Card Text Information Footer (matching reference image) -->
      <div class="mt-4 flex flex-col space-y-1">
        <div class="flex justify-between items-center text-xs">
          <span class="font-mono uppercase text-[11px] text-neutral-400 tracking-wider">
            ${doc.edition}
          </span>
          <span class="font-semibold font-mono text-xs ${isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'}">
            ${isUnlocked ? 'FREE UNLOCKED' : '₹' + doc.price}
          </span>
        </div>
        
        <h4 class="font-serif font-bold text-sm text-neutral-900 dark:text-white line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          ${doc.title}
        </h4>
        
        <p class="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 font-sans">
          ${doc.subtitle}
        </p>
      </div>

    </div>
  `;
}
