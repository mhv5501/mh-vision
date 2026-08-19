export function renderNavbar(state) {
  const isDark = document.documentElement.classList.contains('dark');
  const unlockedCount = state.unlockedDocs ? state.unlockedDocs.length : 0;
  const user = state.currentUser;
  const isUserMenuOpen = Boolean(state.isUserMenuOpen);

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
        <div class="flex items-center space-x-2 sm:space-x-3">
          
          <!-- Search trigger -->
          <button id="search-trigger-btn" class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors" title="Quick Search (Ctrl+K)">
            <i data-lucide="search" class="w-5 h-5"></i>
          </button>

          <!-- Dark / Light Mode Toggle -->
          <button id="theme-toggle-btn" class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors" title="Toggle Theme">
            <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>
          </button>

          <!-- User Authentication / Profile Section -->
          ${user ? `
            <!-- Logged In User Profile Pill & Dropdown -->
            <div class="relative">
              <button id="user-menu-btn" class="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors text-xs font-medium">
                ${user.photoURL ? `
                  <img src="${user.photoURL}" alt="${user.displayName}" class="w-6 h-6 rounded-full object-cover" />
                ` : `
                  <div class="w-6 h-6 rounded-full bg-amber-500 text-neutral-900 flex items-center justify-center font-bold text-[11px]">
                    ${(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                `}
                <span class="hidden sm:inline max-w-[100px] truncate text-neutral-800 dark:text-neutral-200 font-sans">
                  ${user.displayName || user.email.split('@')[0]}
                </span>
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-neutral-400"></i>
              </button>

              <!-- Dropdown Menu -->
              ${isUserMenuOpen ? `
                <div id="user-dropdown-menu" class="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141416] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div class="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p class="text-xs font-bold text-neutral-900 dark:text-white truncate">${user.displayName}</p>
                    <p class="text-[11px] font-mono text-neutral-400 truncate">${user.email}</p>
                  </div>

                  <button onclick="window.handleOpenLibraryDrawer()" class="w-full px-4 py-2.5 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 flex items-center justify-between transition-colors">
                    <span class="flex items-center space-x-2">
                      <i data-lucide="bookmark" class="w-4 h-4 text-amber-500"></i>
                      <span>My Unlocked Library</span>
                    </span>
                    <span class="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                      ${unlockedCount}
                    </span>
                  </button>

                  <div class="h-px bg-neutral-100 dark:bg-neutral-800 my-1"></div>

                  <button onclick="window.handleUserSignOut()" class="w-full px-4 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2 transition-colors">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              ` : ''}
            </div>
          ` : `
            <!-- Logged Out: Sign In Button -->
            <button onclick="window.handlePromptUserAuth('login')" class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>Sign In</span>
            </button>
          `}

        </div>

      </div>
    </header>
  `;
}
