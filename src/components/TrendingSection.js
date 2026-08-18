export function renderTrendingSection(state) {
  return `
    <section id="trending" class="py-16 md:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-12">
          <div class="inline-block text-[11px] font-mono tracking-luxury uppercase text-neutral-400 dark:text-neutral-500 mb-2">
            EDITORIAL DISPATCHES
          </div>
          <h2 class="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight max-w-xl">
            Curated papers & essays with trending topics this week
          </h2>
        </div>

        <!-- Bento Editorial Grid matching reference image layout -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          <!-- Left Large Featured Card with circular "Read now" button (matches reference) -->
          <div class="md:col-span-4 relative group rounded-2xl overflow-hidden bg-neutral-900 text-white min-h-[380px] p-8 flex flex-col justify-between cursor-pointer border border-neutral-800"
               onclick="window.handleOpenDocument('doc-001')">
            
            <!-- Background Image overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
            <div class="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

            <div class="relative z-20">
              <span class="px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest bg-amber-500/20 text-amber-300">
                AI & COGNITION
              </span>
            </div>

            <div class="relative z-20 space-y-3">
              <h3 class="text-2xl font-serif font-bold leading-tight">
                The Architecture of Thought: Multi-Manifold Geodesics
              </h3>
              <p class="text-xs text-neutral-400 font-serif leading-relaxed line-clamp-3">
                How modern foundation models establish non-Euclidean manifolds for human semantic abstraction.
              </p>
              <div class="pt-2 text-xs font-mono text-neutral-300">
                Dr. Evelyn Vance · 48 Pages
              </div>
            </div>

            <!-- Prominent Floating Circular "Read now" Button (Matches reference image) -->
            <div class="absolute bottom-6 right-6 z-30 w-20 h-20 rounded-full bg-white text-neutral-900 flex flex-col items-center justify-center font-bold text-xs shadow-2xl group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300">
              <span>Read</span>
              <span>now</span>
            </div>

          </div>

          <!-- Middle Column (2 Stacked Cards) -->
          <div class="md:col-span-4 flex flex-col gap-6">
            
            <!-- Top Middle Card -->
            <div class="relative group rounded-2xl bg-[#1c1917] text-white p-6 flex-1 flex flex-col justify-between cursor-pointer border border-neutral-800 hover:border-neutral-600 transition-all"
                 onclick="window.handleOpenDocument('doc-002')">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  DESIGN SYSTEMS
                </span>
                <h4 class="text-lg font-serif font-bold mt-1 group-hover:text-amber-300 transition-colors">
                  Monochrome & Minimalist Typography
                </h4>
                <p class="text-xs text-neutral-400 font-serif mt-2 line-clamp-2">
                  Swiss grid frameworks and optical sizing for zero eye fatigue.
                </p>
              </div>
              <div class="flex justify-between items-center pt-4 text-xs font-mono text-neutral-400 border-t border-neutral-800/80">
                <span>36p · $3.49</span>
                <span class="text-white flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Unlock</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </span>
              </div>
            </div>

            <!-- Bottom Middle Card -->
            <div class="relative group rounded-2xl bg-[#1e1b4b] text-white p-6 flex-1 flex flex-col justify-between cursor-pointer border border-neutral-800 hover:border-neutral-600 transition-all"
                 onclick="window.handleOpenDocument('doc-003')">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                  DECENTRALIZED ECONOMICS
                </span>
                <h4 class="text-lg font-serif font-bold mt-1 group-hover:text-indigo-200 transition-colors">
                  The Sovereign Algorithm: Micro-Economies
                </h4>
              </div>
              <div class="flex justify-between items-center pt-4 text-xs font-mono text-neutral-400 border-t border-indigo-900/50">
                <span>54p · $5.99</span>
                <span class="text-white flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Unlock</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </span>
              </div>
            </div>

          </div>

          <!-- Right Column (2 Stacked Cards + CTA) -->
          <div class="md:col-span-4 flex flex-col gap-6">
            
            <!-- Top Right Card -->
            <div class="relative group rounded-2xl bg-[#064e3b] text-white p-6 flex-1 flex flex-col justify-between cursor-pointer border border-neutral-800 hover:border-neutral-600 transition-all"
                 onclick="window.handleOpenDocument('doc-004')">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                  QUANTUM PHYSICS
                </span>
                <h4 class="text-lg font-serif font-bold mt-1 group-hover:text-emerald-200 transition-colors">
                  Quantum Coherence & Topological Protection
                </h4>
                <p class="text-xs text-emerald-100/70 font-serif mt-2 line-clamp-2">
                  Braiding non-Abelian anyons for fault-tolerant logical memory.
                </p>
              </div>
              <div class="flex justify-between items-center pt-4 text-xs font-mono text-emerald-200/80 border-t border-emerald-900/50">
                <span>42p · $4.49</span>
                <span class="text-white flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Unlock</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </span>
              </div>
            </div>

            <!-- Bottom Right Card matching "Discount for this week / See more ->" in reference -->
            <div class="rounded-2xl bg-white dark:bg-neutral-900 p-6 flex-1 flex flex-col justify-between border border-neutral-200 dark:border-neutral-800">
              <div>
                <div class="text-[10px] font-mono uppercase tracking-luxury text-amber-600 dark:text-amber-400 font-bold mb-1">
                  ALL-ACCESS PASS
                </div>
                <h4 class="text-base font-serif font-bold text-neutral-900 dark:text-white">
                  Unlimited Research Archive Access
                </h4>
                <p class="text-xs text-neutral-500 mt-1">
                  Get full instant decryption to all present and upcoming monographs.
                </p>
              </div>
              
              <div class="pt-4 flex items-center justify-between">
                <span class="font-serif font-bold text-xl text-neutral-900 dark:text-white">$19<span class="text-xs font-sans text-neutral-400 font-normal">/month</span></span>
                <a href="#catalog" class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-neutral-900 dark:border-white text-xs font-semibold text-neutral-900 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-colors">
                  <span>See more</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  `;
}
