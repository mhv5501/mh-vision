import { renderDocumentCard } from './DocumentCard.js';

export function renderCatalogSection(state) {
  const docs = state.documents || [];

  return `
    <section id="collection" class="py-16 md:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Centered Header -->
        <div class="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div class="inline-block text-[11px] font-mono tracking-luxury uppercase text-amber-600 dark:text-amber-400 font-semibold">
            OFFICIAL PUBLICATIONS
          </div>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
            Knowledge & Study Archives
          </h2>
          <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-sans max-w-md mx-auto pt-1">
            Access verified study materials, competitive exam guides, current affairs, and research PDFs.
          </p>
        </div>

        <!-- Document Cards Grid or Empty State -->
        ${docs.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            ${docs.map(doc => {
              const isUnlocked = state.unlockedDocs.includes(doc.id);
              return renderDocumentCard(doc, isUnlocked);
            }).join('')}
          </div>
        ` : `
          <!-- Empty State when starting clean -->
          <div class="max-w-md mx-auto text-center py-16 px-6 rounded-3xl bg-neutral-100/60 dark:bg-[#141416]/60 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <img src="assets/logo.jpg" alt="MH VISION" class="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-amber-500/40 shadow-md opacity-90" />
            <h3 class="font-serif font-bold text-xl text-neutral-900 dark:text-white">
              Publications Catalog Live
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              New PDF materials and study guides are currently being prepared. Check back shortly or stay tuned to our channel!
            </p>
            <div class="pt-2">
              <button onclick="window.handlePromptAdminLogin()" class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                <i data-lucide="upload" class="w-3.5 h-3.5 text-amber-500"></i>
                <span>Admin: Upload PDF</span>
              </button>
            </div>
          </div>
        `}

      </div>
    </section>
  `;
}
