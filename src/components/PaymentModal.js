export function renderPaymentModal(doc, state) {
  if (!doc) return '';

  const activeMethod = state.paymentMethod || 'card'; // card, apple, demo
  const discount = state.appliedDiscount || 0;
  const finalPrice = Math.max(0, doc.price - discount).toFixed(2);

  return `
    <div id="payment-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300">
      
      <!-- Modal Box -->
      <div id="payment-modal-card" class="relative w-full max-w-xl bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden transform transition-all duration-300 scale-100 max-h-[92vh] flex flex-col text-neutral-900 dark:text-neutral-100">
        
        <!-- Modal Top Bar -->
        <div class="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              256-Bit Encrypted Checkout
            </span>
          </div>

          <button id="close-payment-modal-btn" class="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          <!-- Document Purchase Summary Card -->
          <div class="flex items-center space-x-4 p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
            
            <!-- Mini Cover Art -->
            <div class="w-16 h-20 rounded-lg flex-shrink-0 flex flex-col justify-between p-2 text-white shadow-md relative overflow-hidden" style="background: ${doc.coverStyle};">
              <div class="absolute inset-y-0 left-0 w-1.5 bg-white/20 pointer-events-none"></div>
              <span class="text-[7px] font-mono uppercase tracking-wider text-neutral-300">${doc.pages}p</span>
              <p class="text-[9px] font-serif font-bold leading-tight line-clamp-2">${doc.title}</p>
              <span class="text-[7px] font-mono text-amber-400">PDF</span>
            </div>

            <!-- Meta -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  ${doc.category}
                </span>
                <span class="text-[11px] font-mono text-neutral-400">Instant Unlock</span>
              </div>
              <h4 class="font-serif font-bold text-base text-neutral-900 dark:text-white truncate mt-1">
                ${doc.title}
              </h4>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                by ${doc.author} · ${doc.pages} Pages Vector PDF
              </p>
            </div>

            <!-- Price -->
            <div class="text-right flex-shrink-0">
              <span class="text-xs text-neutral-400 line-through block ${discount > 0 ? '' : 'hidden'}">₹${doc.price}</span>
              <span class="font-serif font-bold text-xl text-neutral-900 dark:text-white">₹${finalPrice}</span>
              <span class="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 block">Lifetime Access</span>
            </div>

          </div>

          <!-- Payment Method Selector Tabs -->
          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
              Select Payment Method
            </label>
            <div class="grid grid-cols-3 gap-2">
              
              <!-- Credit Card Tab -->
              <button class="payment-tab-btn py-3 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                activeMethod === 'card' 
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-sm' 
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }" data-method="card">
                <i data-lucide="credit-card" class="w-4 h-4"></i>
                <span>Credit Card</span>
              </button>

              <!-- Apple / Google Pay Tab -->
              <button class="payment-tab-btn py-3 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                activeMethod === 'apple' 
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-sm' 
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }" data-method="apple">
                <i data-lucide="smartphone" class="w-4 h-4"></i>
                <span>Apple / GPay</span>
              </button>

              <!-- Instant Demo Access Tab (Recommended for quick test) -->
              <button class="payment-tab-btn py-3 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                activeMethod === 'demo' 
                  ? 'border-amber-600 bg-amber-600 text-white shadow-sm' 
                  : 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
              }" data-method="demo">
                <i data-lucide="zap" class="w-4 h-4 text-amber-400"></i>
                <span>⚡ Instant Demo</span>
              </button>

            </div>
          </div>

          <!-- Method 1: Credit Card Form & Animated Card Preview -->
          ${activeMethod === 'card' ? `
            <div class="space-y-4">
              
              <!-- Virtual Card Preview -->
              <div id="virtual-credit-card" class="w-full h-40 rounded-2xl p-5 text-white bg-gradient-to-tr from-neutral-900 via-neutral-800 to-stone-900 border border-neutral-700/80 shadow-xl flex flex-col justify-between relative overflow-hidden transition-transform duration-300">
                <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div class="flex justify-between items-center z-10">
                  <span class="font-display tracking-widest text-sm font-bold text-amber-300">MH VISION VAULT</span>
                  <i data-lucide="nfc" class="w-5 h-5 text-neutral-400"></i>
                </div>

                <div class="z-10 font-mono text-base tracking-[0.2em] text-neutral-200" id="card-preview-number">
                  •••• •••• •••• 4242
                </div>

                <div class="flex justify-between items-end z-10 text-xs font-mono">
                  <div>
                    <span class="text-[9px] uppercase tracking-wider text-neutral-400 block">CARDHOLDER</span>
                    <span class="font-sans font-medium text-neutral-100 uppercase" id="card-preview-name">SCHOLAR MEMBER</span>
                  </div>
                  <div>
                    <span class="text-[9px] uppercase tracking-wider text-neutral-400 block">EXPIRES</span>
                    <span class="text-neutral-100" id="card-preview-expiry">12/28</span>
                  </div>
                </div>
              </div>

              <!-- Inputs -->
              <div class="space-y-3 pt-2">
                <div>
                  <label class="block text-[11px] font-mono uppercase text-neutral-500 mb-1">Card Number</label>
                  <div class="relative">
                    <input type="text" id="card-number-input" placeholder="4242 4242 4242 4242" maxlength="19" value="4242 4242 4242 4242"
                           class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors" />
                    <i data-lucide="lock" class="w-4 h-4 text-neutral-400 absolute right-3.5 top-3"></i>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-mono uppercase text-neutral-500 mb-1">Expiry Date</label>
                    <input type="text" id="card-expiry-input" placeholder="MM/YY" maxlength="5" value="12/28"
                           class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-mono uppercase text-neutral-500 mb-1">CVC / CVV</label>
                    <input type="password" id="card-cvv-input" placeholder="•••" maxlength="4" value="987"
                           class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors" />
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-mono uppercase text-neutral-500 mb-1">Cardholder Name</label>
                  <input type="text" id="card-name-input" placeholder="Full Name" value="Evelyn Vance"
                         class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors" />
                </div>
              </div>

            </div>
          ` : ''}

          <!-- Method 2: Apple Pay / GPay -->
          ${activeMethod === 'apple' ? `
            <div class="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
              <div class="w-12 h-12 mx-auto rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-md">
                <i data-lucide="smartphone" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="font-bold text-sm text-neutral-900 dark:text-white">Instant Biometric Checkout</h4>
                <p class="text-xs text-neutral-500 mt-1">One-touch authentication with Apple Wallet / Google Pay.</p>
              </div>
              <div class="py-2">
                <div class="inline-flex items-center space-x-2 text-xs font-mono text-neutral-400">
                  <i data-lucide="shield-check" class="w-4 h-4 text-emerald-500"></i>
                  <span>No card number shared with merchant</span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Method 3: Instant Demo Pass -->
          ${activeMethod === 'demo' ? `
            <div class="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
              <div class="w-12 h-12 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce">
                <i data-lucide="zap" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="font-bold text-sm text-amber-900 dark:text-amber-200">Instant Evaluation Pass (1-Click Test)</h4>
                <p class="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">
                  Bypasses real credit card charging so you can immediately inspect and test the full PDF Reader environment!
                </p>
              </div>
              <div class="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                100% Free Developer Sandbox
              </div>
            </div>
          ` : ''}

          <!-- Promo Code Accordion -->
          <div class="pt-2">
            <div class="flex items-center space-x-2">
              <input type="text" id="promo-code-input" placeholder="Promo code (try 'TEST100')" class="flex-1 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-xs uppercase focus:outline-none focus:border-neutral-900 dark:focus:border-white">
              <button id="apply-promo-btn" class="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                Apply
              </button>
            </div>
            ${discount > 0 ? `<p class="text-xs text-emerald-600 font-mono mt-1">✓ Promo code applied: -₹${discount}</p>` : ''}
          </div>

        </div>

        <!-- Bottom Action Bar & Processing Button -->
        <div class="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 flex flex-col space-y-3">
          
          <button id="confirm-payment-btn" 
                  class="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-lg flex items-center justify-center space-x-2.5 disabled:opacity-50"
                  data-doc-id="${doc.id}">
            <i data-lucide="${activeMethod === 'demo' ? 'zap' : 'lock'}" class="w-4 h-4"></i>
            <span id="pay-btn-text">
              ${activeMethod === 'demo' ? '⚡ Unlock Immediately (Demo Mode)' : `Pay ₹${finalPrice} & Unlock PDF`}
            </span>
          </button>

          <!-- Security note -->
          <div class="flex items-center justify-center space-x-4 text-[10px] font-mono text-neutral-400">
            <span class="flex items-center space-x-1">
              <i data-lucide="shield" class="w-3 h-3 text-emerald-500"></i>
              <span>SSL 256-Bit</span>
            </span>
            <span>•</span>
            <span>Instant Digital Delivery</span>
            <span>•</span>
            <span>Universal PDF Reader</span>
          </div>

        </div>

      </div>

    </div>
  `;
}
