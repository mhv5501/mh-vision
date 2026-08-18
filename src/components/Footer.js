export function renderFooter() {
  return `
    <footer id="pricing" class="bg-[#111111] text-white pt-16 pb-12 border-t border-neutral-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Top Editorial Row matching reference image -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-10 items-end pb-16 border-b border-neutral-800/80">
          
          <!-- Left Big Slogan -->
          <div class="md:col-span-6 space-y-4">
            <img src="assets/logo.jpg" alt="MH VISION Logo" class="w-12 h-12 rounded-full object-cover shadow-lg mb-4 ring-2 ring-amber-500/40" />
            <h3 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              knowledge, awareness <br/>
              <span class="italic font-light text-amber-400">& intellectual growth.</span>
            </h3>
            <p class="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              MH VISION · Malayalam Knowledge Hub · 2026
            </p>
          </div>

          <!-- Right Newsletter Subscribe form matching reference -->
          <div class="md:col-span-6 md:pl-10 space-y-3">
            <p class="text-xs font-sans text-neutral-400">
              Subscribe to receive new publication updates and educational research dispatches.
            </p>
            
            <form id="newsletter-form" onsubmit="event.preventDefault(); window.handleNewsletterSubmit(event);" class="relative flex items-center">
              <input 
                type="email" 
                id="newsletter-email"
                required
                placeholder="Your email address" 
                class="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-full py-3.5 pl-6 pr-14 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
              <button 
                type="submit" 
                class="absolute right-1.5 w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center hover:bg-amber-400 transition-colors shadow-md group">
                <i data-lucide="arrow-right" class="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"></i>
              </button>
            </form>
            <p id="newsletter-status" class="text-xs text-emerald-400 font-mono hidden">✓ You are subscribed to MH VISION Dispatches.</p>
          </div>

        </div>

        <!-- Bottom Copyright & Socials (Centered) -->
        <div class="pt-10 flex flex-col items-center justify-center space-y-4 text-center">
          
          <div class="flex items-center space-x-6 text-neutral-500">
            <a href="#" class="hover:text-white transition-colors" title="YouTube"><i data-lucide="youtube" class="w-4 h-4 text-red-500"></i></a>
            <a href="#" class="hover:text-white transition-colors" title="Twitter"><i data-lucide="twitter" class="w-4 h-4"></i></a>
            <a href="#" class="hover:text-white transition-colors" title="Web"><i data-lucide="globe" class="w-4 h-4"></i></a>
          </div>

          <div class="text-xs font-mono text-neutral-500">
            © 2026 MH VISION KNOWLEDGE HUB. All rights reserved.
          </div>

          <div class="text-xs font-sans text-neutral-400 tracking-wider uppercase">
            Created by <span onclick="window.handlePromptAdminLogin()" class="text-white font-semibold cursor-pointer hover:text-amber-400 transition-colors" title="MH VISION Security Console">Ruwaishid m</span>
          </div>

        </div>

      </div>
    </footer>
  `;
}
