export function renderPaymentModal(doc, state) {
  if (!doc) return '';

  const user = state.currentUser;
  const finalPrice = doc.price.toFixed(2);

  return `
    <div id="payment-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      
      <!-- Modal Card -->
      <div id="payment-modal-card" class="relative w-full max-w-md bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden transform transition-all duration-300 flex flex-col text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95">
        
        <!-- Top Security Header -->
        <div class="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-400 font-semibold">
              Official Razorpay Checkout
            </span>
          </div>

          <button id="close-payment-modal-btn" class="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 sm:p-7 space-y-5">
          
          <!-- Document Purchase Summary Card -->
          <div class="flex items-center space-x-4 p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
            
            <!-- Mini Cover Art -->
            <div class="w-16 h-20 rounded-xl flex-shrink-0 flex flex-col justify-between p-2 text-white shadow-md relative overflow-hidden" style="background: ${doc.coverStyle};">
              <div class="absolute inset-y-0 left-0 w-1 bg-white/25 pointer-events-none"></div>
              <span class="text-[7px] font-mono uppercase tracking-wider text-neutral-300">${doc.pages}p</span>
              <p class="text-[9px] font-serif font-bold leading-tight line-clamp-2">${doc.title}</p>
              <span class="text-[7px] font-mono text-amber-400 font-bold">PDF</span>
            </div>

            <!-- Meta Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                  ${doc.category}
                </span>
                <span class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">✓ Instant Unlock</span>
              </div>
              <h4 class="font-serif font-bold text-base text-neutral-900 dark:text-white truncate mt-1">
                ${doc.title}
              </h4>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                ${doc.author} · ${doc.pages} Pages · High-Res PDF
              </p>
            </div>

            <!-- Price Breakdown -->
            <div class="text-right flex-shrink-0">
              <span class="font-serif font-bold text-2xl text-neutral-900 dark:text-white">₹${finalPrice}</span>
              <span class="text-[9px] font-mono text-neutral-400 block">INR</span>
            </div>

          </div>

          <!-- Verified Buyer Account Info -->
          ${user ? `
            <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div class="flex items-center space-x-2.5 min-w-0 pr-2">
                <div class="w-7 h-7 rounded-full bg-amber-500 text-neutral-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  ${user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-300 font-bold tracking-wider">
                    Purchasing Account
                  </p>
                  <p class="text-xs font-sans text-neutral-800 dark:text-neutral-200 truncate font-semibold">
                    ${user.displayName || user.email} <span class="opacity-60 text-[11px]">(${user.email})</span>
                  </p>
                </div>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold whitespace-nowrap">
                Synced to Cloud
              </span>
            </div>
          ` : ''}

        </div>

        <!-- Bottom Action Bar & Razorpay Checkout Trigger -->
        <div class="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 flex flex-col space-y-3">
          
          <button 
            id="confirm-razorpay-btn" 
            onclick="window.handleInitiateRazorpay('${doc.id}')"
            class="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-xl flex items-center justify-center space-x-2.5">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
            <span id="pay-btn-text">
              Pay ₹${finalPrice} with Razorpay & Unlock
            </span>
          </button>

          <!-- Security note -->
          <div class="flex items-center justify-center space-x-3 text-[10px] font-mono text-neutral-400 text-center">
            <span>🔒 Secured by Razorpay</span>
            <span>•</span>
            <span>Instant PDF Unlock</span>
            <span>•</span>
            <span>Lifetime Access</span>
          </div>

        </div>

      </div>

    </div>
  `;
}
