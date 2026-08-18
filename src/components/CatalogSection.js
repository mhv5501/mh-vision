import { renderDocumentCard } from './DocumentCard.js';

export function renderCatalogSection(state) {
  const docs = state.documents;

  return `
    <section id="collection" class="py-16 md:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Centered Header -->
        <div class="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div class="inline-block text-[11px] font-mono tracking-luxury uppercase text-neutral-400 dark:text-neutral-500">
            CURATED MONOGRAPHS
          </div>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
            Our Best Collections
          </h2>
          <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-sans max-w-md mx-auto pt-1">
            Explore our peer-reviewed papers, design manuals, and theoretical treatises with instant vector reading.
          </p>
        </div>

        <!-- Document Cards Grid (4 columns on desktop) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          ${docs.map(doc => {
            const isUnlocked = state.unlockedDocs.includes(doc.id);
            return renderDocumentCard(doc, isUnlocked);
          }).join('')}
        </div>

      </div>
    </section>
  `;
}
