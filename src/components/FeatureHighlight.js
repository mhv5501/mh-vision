export function renderFeatureHighlight() {
  return `
    <section id="about" class="py-16 md:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Centered Header -->
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span class="inline-block text-[11px] font-mono tracking-luxury uppercase text-neutral-400 dark:text-neutral-500">
            ABOUT MH VISION
          </span>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
            Curated Knowledge, <br/>
            <span class="italic font-normal">Crafted for Deep Focus.</span>
          </h2>
          <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans max-w-2xl mx-auto pt-2">
            MH VISION combines high-quality educational research with a streamlined gateway to provide frictionless instant access to study monographs rendered in crisp vector PDF format.
          </p>
        </div>

        <!-- 3-Column Editorial Pillars -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 text-center md:text-left">
          
          <div class="space-y-3">
            <span class="font-mono text-xs text-neutral-400 font-bold">01 / TYPOGRAPHY</span>
            <h3 class="font-serif font-bold text-lg text-neutral-900 dark:text-white">Optical Precision</h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every document is formatted using Swiss grid systems, balanced leading, and custom serif typefaces to prevent visual fatigue during extended reading sessions.
            </p>
          </div>

          <div class="space-y-3">
            <span class="font-mono text-xs text-neutral-400 font-bold">02 / GATEWAY</span>
            <h3 class="font-serif font-bold text-lg text-neutral-900 dark:text-white">Seamless Checkout</h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Unlock monographs in seconds using standard cards or express digital wallets with zero mandatory account hurdles.
            </p>
          </div>

          <div class="space-y-3">
            <span class="font-mono text-xs text-neutral-400 font-bold">03 / READER</span>
            <h3 class="font-serif font-bold text-lg text-neutral-900 dark:text-white">Distraction-Free Suite</h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Enjoy multi-page vector navigation, customizable color themes (Paper, Sepia, Dark, OLED), zoom, and integrated scholar notes.
            </p>
          </div>

        </div>

      </div>
    </section>
  `;
}
