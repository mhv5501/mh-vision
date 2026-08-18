export function renderNavbar(state) {
  const isDark = document.documentElement.classList.contains('dark');
  const unlockedCount = state.unlockedDocs.length;

  return `
    <header class="sticky top-0 z-40 w-full glass-panel border-b border-neutral-200/80 dark:border-neutral-800/80 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <!-- Brand / Logo -->
        <div class="flex items-center space-x-3 cursor-pointer group" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
          <img src="assets/logo.jpg" alt="MH VISION Logo" class="w-10 h-10 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300 ring-2 ring-amber-500/40" />
          <div class="flex flex-col">
            <span class="font-display tracking-[0.2em] text-xl font-black uppercase text-neutral-900 dark:text-neutral-100">
              MH VISION
            </span>
            <span class="text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-mono -mt-1 font-semibold">
              Malayalam Knowledge Hub
            </span>
          </div>
        </div>

        <!-- Navigation Links: Home, Collection, About -->
        <nav class="hidden md:flex items-center space-x-10 text-sm font-medium tracking-wide">
          <a href="#home" class="text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors">Home</a>
          <a href="#collection" class="text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors">Collection</a>
          <a href="#about" class="text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors">About</a>
        </nav>

        <!-- Right Utility Actions -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Search trigger -->
          <button id="search-trigger-btn" class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors" title="Quick Search (Ctrl+K)">
            <i data-lucide="search" class="w-5 h-5"></i>
          </button>

          <!-- Dark / Light Mode Toggle -->
          <button id="theme-toggle-btn" class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors" title="Toggle Theme">
            <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>
          </button>
        </div>

      </div>
    </header>
  `;
}
