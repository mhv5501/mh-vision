export function renderHero() {
  return `
    <section id="home" class="relative pt-8 pb-12 md:pt-14 md:pb-16 overflow-hidden bg-grain">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Top Editorial Split Row -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6 md:mb-10">
          
          <!-- Left Column -->
          <div class="md:col-span-6 space-y-5">
            <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono tracking-wider uppercase text-amber-800 dark:text-amber-300">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Malayalam Knowledge Hub · Official Publications</span>
            </div>
            
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white leading-[1.15] tracking-tight">
              Knowledge, Awareness & Growth. <br class="hidden sm:inline"/>
              <span class="italic font-normal text-amber-700 dark:text-amber-400">Think Smart, Stay Ahead.</span>
            </h1>

            <div>
              <a href="#collection" class="inline-flex items-center space-x-2.5 px-6 py-2.5 rounded-full border border-neutral-900 dark:border-white text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all duration-300 shadow-sm hover:shadow group">
                <span>Explore PDF Publications</span>
                <i data-lucide="arrow-up-right" class="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
              </a>
            </div>
          </div>

          <!-- Right Column (Editorial Description) -->
          <div class="md:col-span-6 md:pl-8 flex flex-col justify-end text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed font-sans border-l border-neutral-300/60 dark:border-neutral-800 md:h-full">
            <p>
              Welcome to the official digital repository of <strong>MH VISION</strong>. We publish structured, high-impact study materials, educational guides, competitive analysis, and intellectual research in high-fidelity PDF formats designed for focused reading.
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
              <span>EDUCATION</span>
              <span>•</span>
              <span>CURRENT AFFAIRS</span>
              <span>•</span>
              <span>SCIENCE & TECH</span>
              <span>•</span>
              <span>ANALYSIS</span>
            </div>
          </div>

        </div>

        <!-- Huge Display Brand Headline: MH VISION -->
        <div class="relative text-center select-none my-4 md:my-8">
          <span class="block font-display text-[12vw] md:text-[10vw] font-black tracking-[0.14em] leading-none text-neutral-900 dark:text-neutral-100 opacity-95 transition-all duration-500 hover:tracking-[0.18em] cursor-default">
            MH VISION
          </span>
          <p class="text-xs sm:text-sm uppercase tracking-[0.3em] font-mono text-neutral-400 mt-2">
            Malayalam Knowledge Hub · Think Smart, Stay Ahead
          </p>
        </div>

      </div>
    </section>
  `;
}
