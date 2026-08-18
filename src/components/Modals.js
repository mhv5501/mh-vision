export function renderQuickSearchModal(state) {
  const query = state.searchQuery || '';
  const searchResults = query.trim() === ''
    ? state.documents.slice(0, 4)
    : state.documents.filter(d => 
        d.title.toLowerCase().includes(query.toLowerCase()) ||
        d.author.toLowerCase().includes(query.toLowerCase()) ||
        d.category.toLowerCase().includes(query.toLowerCase()) ||
        d.subtitle.toLowerCase().includes(query.toLowerCase())
      );

  return `
    <div id="search-modal-backdrop" class="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md transition-opacity">
      <div class="w-full max-w-2xl bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        
        <!-- Search Input Bar -->
        <div class="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center space-x-3">
          <i data-lucide="search" class="w-5 h-5 text-neutral-400"></i>
          <input 
            type="text" 
            id="search-modal-input" 
            placeholder="Search monographs, authors, AI topics, theorems..." 
            value="${query}"
            autofocus
            class="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none font-sans"
          />
          <button id="close-search-modal-btn" class="px-2 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            ESC
          </button>
        </div>

        <!-- Search Results List -->
        <div class="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <div class="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            ${query.trim() === '' ? 'Curated Suggestions' : `Found ${searchResults.length} Monographs`}
          </div>

          ${searchResults.map(doc => {
            const isUnlocked = state.unlockedDocs.includes(doc.id);
            return `
              <div class="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors flex items-center justify-between cursor-pointer group"
                   onclick="window.handleOpenDocument('${doc.id}')">
                <div class="flex items-center space-x-3 min-w-0 pr-4">
                  <div class="w-10 h-12 rounded flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold" style="background: ${doc.coverStyle};">
                    PDF
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-serif font-bold text-sm text-neutral-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                      ${doc.title}
                    </h4>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      ${doc.author} · <span class="font-mono">${doc.category}</span>
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-3 flex-shrink-0">
                  <span class="text-xs font-mono font-bold ${isUnlocked ? 'text-emerald-500' : 'text-neutral-900 dark:text-white'}">
                    ${isUnlocked ? 'UNLOCKED' : '₹' + doc.price}
                  </span>
                  <div class="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
                    <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                  </div>
                </div>
              </div>
            `;
          }).join('')}

          ${searchResults.length === 0 ? `
            <div class="text-center py-10 font-serif text-neutral-400 italic">
              No matching monographs found for "${query}".
            </div>
          ` : ''}
        </div>

      </div>
    </div>
  `;
}

export function renderAdminLoginModal(state) {
  return `
    <div id="admin-auth-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div class="w-full max-w-md bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6 text-neutral-900 dark:text-neutral-100">
        
        <!-- Header -->
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold shadow-md">
              <i data-lucide="lock" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="font-serif font-bold text-lg">MH VISION Security Portal</h3>
              <p class="text-[11px] font-mono text-neutral-400">Malayalam Knowledge Hub · Admin Gateway</p>
            </div>
          </div>
          <button id="close-admin-auth-btn" class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <p class="text-xs text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed">
          Please enter the administrator master passcode to access the publication management console and pricing settings.
        </p>

        <!-- Auth Form -->
        <form id="admin-auth-form" onsubmit="event.preventDefault(); window.handleVerifyAdminPasscode(event);" class="space-y-4">
          
          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Master Passcode *</label>
            <div class="relative">
              <input type="password" id="admin-passcode-input" required autofocus placeholder="Enter admin password..."
                     class="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors" />
              <button type="button" id="toggle-admin-pass-visibility" class="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
            </div>
            <p id="admin-auth-error" class="text-xs text-red-500 font-mono mt-1.5 hidden flex items-center space-x-1">
              <i data-lucide="alert-circle" class="w-3.5 h-3.5 inline mr-1"></i>
              <span>Access Denied: Incorrect administrator passcode.</span>
            </p>
          </div>

          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-800 dark:text-amber-300">
            <strong>Master Passcode:</strong> <code class="font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-neutral-900 dark:text-white">admin123</code>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" id="cancel-admin-auth-btn" class="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
            <button type="submit" class="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md">
              Unlock Portal
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}

export function renderUploadPDFModal() {
  return `
    <div id="upload-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity">
      <div class="w-full max-w-lg bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
        
        <div class="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 class="font-serif font-bold text-lg text-neutral-900 dark:text-white">Load Custom PDF Document</h3>
            <p class="text-xs text-neutral-500">Test the payment gate or open directly in the reader suite.</p>
          </div>
          <button id="close-upload-modal-btn" class="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Drag & Drop Zone -->
        <div id="pdf-drop-zone" class="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer space-y-3 bg-neutral-50 dark:bg-neutral-900/50">
          <div class="w-12 h-12 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            <i data-lucide="file-up" class="w-6 h-6"></i>
          </div>
          <div>
            <p class="font-bold text-sm text-neutral-900 dark:text-white">Click or Drag & Drop any PDF</p>
            <p class="text-xs text-neutral-400 font-mono mt-1">Supports standard .pdf files</p>
          </div>
          <input type="file" id="pdf-file-input" accept=".pdf" class="hidden">
        </div>

      </div>
    </div>
  `;
}

export function renderLibraryDrawer(state) {
  const unlockedDocsList = state.documents.filter(d => state.unlockedDocs.includes(d.id));

  return `
    <div id="library-drawer-backdrop" class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div class="w-full max-w-md bg-white dark:bg-[#141416] h-full shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col p-6 overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
          <div class="flex items-center space-x-2">
            <i data-lucide="bookmark" class="w-5 h-5 text-amber-500"></i>
            <h3 class="font-serif font-bold text-lg text-neutral-900 dark:text-white">My Unlocked Library</h3>
          </div>
          <button id="close-library-drawer-btn" class="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Documents List -->
        <div class="flex-1 space-y-4">
          ${unlockedDocsList.length === 0 ? `
            <div class="text-center py-20 space-y-3">
              <div class="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <i data-lucide="book-open" class="w-6 h-6"></i>
              </div>
              <p class="font-serif text-neutral-500">No unlocked documents yet.</p>
              <p class="text-xs text-neutral-400">Click any document in the catalog to unlock instant reading access.</p>
            </div>
          ` : `
            ${unlockedDocsList.map(doc => `
              <div class="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900 flex items-center justify-between">
                <div class="min-w-0 pr-3">
                  <span class="text-[9px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">✓ UNLOCKED</span>
                  <h4 class="font-serif font-bold text-sm text-neutral-900 dark:text-white truncate">${doc.title}</h4>
                  <p class="text-xs text-neutral-500 truncate">${doc.pages}p · ${doc.author}</p>
                </div>
                <button onclick="window.handleOpenReader('${doc.id}')" class="px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold whitespace-nowrap hover:opacity-90 transition-opacity">
                  Read
                </button>
              </div>
            `).join('')}
          `}
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <p class="text-[11px] font-mono text-neutral-400">Encrypted Cloud Sync Active</p>
        </div>

      </div>
    </div>
  `;
}
