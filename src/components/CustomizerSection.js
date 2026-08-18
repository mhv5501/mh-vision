export function renderCustomizerSection(state) {
  const currentTheme = state.customizerTheme || 'paper'; // paper, sepia, dark, oled
  const currentFontSize = state.customizerFontSize || 16;
  const currentFontFamily = state.customizerFontFamily || 'serif'; // serif, sans, mono

  const themeClasses = {
    paper: 'bg-[#FAF9F6] text-[#1A1A1A] border-neutral-300',
    sepia: 'bg-[#F6EEDF] text-[#382A1B] border-[#E2D4BF]',
    dark: 'bg-[#18181B] text-[#E4E4E7] border-neutral-700',
    oled: 'bg-[#000000] text-[#D4D4D8] border-neutral-800',
  };

  const fontFamilies = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  };

  return `
    <section id="customizer" class="py-16 md:py-24 bg-neutral-100/60 dark:bg-neutral-900/40 border-t border-neutral-200/80 dark:border-neutral-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header Row -->
        <div class="max-w-2xl mb-12">
          <div class="inline-block text-[11px] font-mono tracking-luxury uppercase text-neutral-400 dark:text-neutral-500 mb-2">
            READING SUITE CUSTOMIZATION
          </div>
          <h2 class="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
            Customize until suits to you
          </h2>
          <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            Personalize reading ambiance, font hierarchies, and cognitive contrast before entering any unlocked treatise.
          </p>
        </div>

        <!-- Interactive Customizer Workspace (Matches 3-column layout in reference) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Left Control Panel -->
          <div class="lg:col-span-3 space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            
            <!-- Color / Theme Palette -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
                Reading Mode Ambiance
              </label>
              <div class="flex items-center space-x-3">
                <button class="theme-select-btn w-8 h-8 rounded-full bg-[#FAF9F6] border-2 ${currentTheme === 'paper' ? 'border-amber-600 ring-2 ring-amber-600/30' : 'border-neutral-300'} shadow-sm transition-all" data-theme="paper" title="Paper White"></button>
                <button class="theme-select-btn w-8 h-8 rounded-full bg-[#F6EEDF] border-2 ${currentTheme === 'sepia' ? 'border-amber-600 ring-2 ring-amber-600/30' : 'border-neutral-300'} shadow-sm transition-all" data-theme="sepia" title="Warm Sepia"></button>
                <button class="theme-select-btn w-8 h-8 rounded-full bg-[#18181B] border-2 ${currentTheme === 'dark' ? 'border-amber-600 ring-2 ring-amber-600/30' : 'border-neutral-600'} shadow-sm transition-all" data-theme="dark" title="Obsidian Dark"></button>
                <button class="theme-select-btn w-8 h-8 rounded-full bg-[#000000] border-2 ${currentTheme === 'oled' ? 'border-amber-600 ring-2 ring-amber-600/30' : 'border-neutral-700'} shadow-sm transition-all" data-theme="oled" title="OLED Pure Black"></button>
              </div>
            </div>

            <!-- Font Size Stepper -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
                Font Scale: <span id="font-size-label" class="text-neutral-900 dark:text-white font-bold">${currentFontSize}px</span>
              </label>
              <div class="flex items-center space-x-3">
                <button id="font-size-dec-btn" class="w-9 h-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  -
                </button>
                <input type="range" id="font-size-range" min="13" max="22" value="${currentFontSize}" class="w-full accent-neutral-900 dark:accent-white cursor-pointer">
                <button id="font-size-inc-btn" class="w-9 h-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  +
                </button>
              </div>
            </div>

            <!-- Font Family Selector -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
                Typography Face
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button class="font-family-btn py-2 px-2 rounded-lg text-xs border text-center transition-all ${currentFontFamily === 'serif' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold border-transparent' : 'border-neutral-300 dark:border-neutral-700 font-serif'}" data-font="serif">
                  Serif
                </button>
                <button class="font-family-btn py-2 px-2 rounded-lg text-xs border text-center transition-all ${currentFontFamily === 'sans' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold border-transparent' : 'border-neutral-300 dark:border-neutral-700 font-sans'}" data-font="sans">
                  Sans
                </button>
                <button class="font-family-btn py-2 px-2 rounded-lg text-xs border text-center transition-all ${currentFontFamily === 'mono' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold border-transparent' : 'border-neutral-300 dark:border-neutral-700 font-mono'}" data-font="mono">
                  Mono
                </button>
              </div>
            </div>

            <!-- Launch Reading Suite CTA -->
            <button onclick="window.handleOpenDocument('doc-001')" class="w-full py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center space-x-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Experience Reader</span>
            </button>

          </div>

          <!-- Center Live Mockup Canvas matching reference with interactive toolbar -->
          <div class="lg:col-span-6 flex justify-center">
            
            <div class="relative w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border transition-all duration-300 ${themeClasses[currentTheme]}">
              
              <!-- Floating Typography Tool Bar (matches the floating pill bar in reference) -->
              <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center space-x-3 z-30">
                <span class="font-bold flex items-center space-x-1">
                  <i data-lucide="sliders" class="w-3.5 h-3.5 text-amber-500"></i>
                  <span>Live Studio</span>
                </span>
                <span class="text-neutral-300 dark:text-neutral-600">|</span>
                <span class="text-[11px] uppercase">${currentTheme} mode · ${currentFontSize}px</span>
              </div>

              <!-- Document Simulation Content -->
              <div class="space-y-4 pt-2 ${fontFamilies[currentFontFamily]}" style="font-size: ${currentFontSize}px;">
                <div class="flex justify-between items-center text-[10px] font-mono opacity-50 uppercase tracking-widest border-b pb-2">
                  <span>TEST ARCHIVE #001</span>
                  <span>SECTION II · P. 14</span>
                </div>

                <h3 class="font-bold text-lg leading-tight tracking-tight">
                  The Principle of Minimal Visual Load
                </h3>

                <p class="leading-relaxed opacity-90">
                  When typography aligns with natural cognitive saccades, comprehension velocity elevates by over 34%. Negative space acts as a cognitive buffer, separating complex theorem proofs into digestible mental models.
                </p>

                <!-- Interactive Highlight Simulation -->
                <div class="p-3.5 rounded-lg bg-amber-500/15 border-l-2 border-amber-500 text-xs leading-relaxed italic">
                  "Distraction-free reading is not a luxury of aesthetics; it is the fundamental prerequisite of original comprehension."
                </div>

                <div class="pt-2 flex items-center justify-between text-[11px] font-mono opacity-60">
                  <span>Reading Speed: 260 wpm</span>
                  <span>AI Takeaway: Ready</span>
                </div>
              </div>

              <!-- Right Floating Tool Widget (matches vertical pill widget in reference image) -->
              <div class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex flex-col space-y-2 bg-white/90 dark:bg-neutral-800/90 p-2 rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                <button class="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" title="Bookmark Page">
                  <i data-lucide="bookmark" class="w-4 h-4"></i>
                </button>
                <button class="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" title="Highlight Text">
                  <i data-lucide="highlighter" class="w-4 h-4 text-amber-500"></i>
                </button>
                <button class="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" title="AI Summarize">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                </button>
              </div>

            </div>

          </div>

          <!-- Right Feature Selection Column matching reference list -->
          <div class="lg:col-span-3 space-y-4">
            <h4 class="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Reader Engine Modules
            </h4>

            <div class="space-y-2.5">
              <div class="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer">
                <div>
                  <h5 class="text-xs font-bold text-neutral-900 dark:text-white">Bionic Contrast</h5>
                  <p class="text-[11px] text-neutral-500">Fixes eye tracking fatigue</p>
                </div>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              <div class="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer">
                <div>
                  <h5 class="text-xs font-bold text-neutral-900 dark:text-white">AI Keynotes Extraction</h5>
                  <p class="text-[11px] text-neutral-500">Extracts essential formulas</p>
                </div>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              <div class="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer">
                <div>
                  <h5 class="text-xs font-bold text-neutral-900 dark:text-white">DRM-Free Portable PDF</h5>
                  <p class="text-[11px] text-neutral-500">Vector high-res printing</p>
                </div>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              <div class="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer">
                <div>
                  <h5 class="text-xs font-bold text-neutral-900 dark:text-white">Multi-Device Sync</h5>
                  <p class="text-[11px] text-neutral-500">Seamless cloud bookmarks</p>
                </div>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  `;
}
