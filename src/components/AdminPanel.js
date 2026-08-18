export function renderAdminPanel(state) {
  const docs = state.documents;
  const editingDoc = state.editingDocId 
    ? state.documents.find(d => d.id === state.editingDocId) 
    : null;

  const totalCatalogValue = docs.reduce((acc, d) => acc + (parseFloat(d.price) || 0), 0);

  return `
    <div class="min-h-screen bg-[#FAF9F6] dark:bg-[#0E0E10] text-neutral-900 dark:text-neutral-100 transition-colors">
      
      <!-- Admin Top Navigation Bar -->
      <header class="sticky top-0 z-40 w-full glass-panel border-b border-neutral-200 dark:border-neutral-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div class="flex items-center space-x-3">
            <img src="assets/logo.jpg" alt="MH VISION" class="w-11 h-11 rounded-full object-cover shadow-md ring-2 ring-amber-500/50" />
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-display tracking-[0.18em] text-lg font-black uppercase">MH VISION</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">ADMIN CONSOLE</span>
              </div>
              <p class="text-[10px] font-mono text-neutral-400">Malayalam Knowledge Hub · Management Suite</p>
            </div>
          </div>

          <!-- Switch back to Live Store View -->
          <div class="flex items-center space-x-3">
            <button id="admin-exit-btn" class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm">
              <i data-lucide="eye" class="w-4 h-4"></i>
              <span>View Live Platform</span>
            </button>
          </div>

        </div>
      </header>

      <!-- Admin Body Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        <!-- Metrics Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="p-6 rounded-2xl bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span class="text-xs font-mono uppercase text-neutral-400 block mb-1">Active Publications</span>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-serif font-bold">${docs.length}</span>
              <span class="text-xs text-emerald-500 font-mono">Vector PDFs</span>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span class="text-xs font-mono uppercase text-neutral-400 block mb-1">Total Catalog Value</span>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-serif font-bold">₹${totalCatalogValue}</span>
              <span class="text-xs text-neutral-400 font-mono">INR</span>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span class="text-xs font-mono uppercase text-neutral-400 block mb-1">Decryption Gateway</span>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-serif font-bold text-emerald-600 dark:text-emerald-400">Online</span>
              <span class="text-xs text-neutral-400 font-mono">WASM 2.0</span>
            </div>
          </div>
        </div>

        <!-- Section 1: Upload & Add New PDF Monograph Form -->
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div class="flex items-center space-x-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div class="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <i data-lucide="upload-cloud" class="w-4 h-4 text-amber-600"></i>
            </div>
            <div>
              <h2 class="font-serif font-bold text-xl">Upload & Publish New PDF Publication</h2>
              <p class="text-xs text-neutral-500">Configure publication metadata, pricing in INR (₹), and reader contents.</p>
            </div>
          </div>

          <form id="admin-add-doc-form" onsubmit="event.preventDefault(); window.handleAdminAddDoc(event);" class="space-y-6">
            
            <!-- Drag & Drop / File Input -->
            <div id="admin-pdf-dropzone" class="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer bg-neutral-50/50 dark:bg-neutral-900/30">
              <i data-lucide="file-plus" class="w-8 h-8 mx-auto text-neutral-400 mb-2"></i>
              <p class="text-xs font-bold text-neutral-800 dark:text-neutral-200">Click or Drop PDF file here to auto-fill metadata</p>
              <p class="text-[11px] text-neutral-400 font-mono mt-0.5" id="admin-selected-file-label">No file selected (optional)</p>
              <input type="file" id="admin-file-input" accept=".pdf" class="hidden">
            </div>

            <!-- Row 1: Title & Subtitle -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Publication Title *</label>
                <input type="text" id="new-doc-title" required placeholder="e.g. Kerala PSC & Competitive Exam Master Guide"
                       class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors">
              </div>

              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Subtitle / Topic *</label>
                <input type="text" id="new-doc-subtitle" required placeholder="e.g. Current Affairs, History & Science Fundamentals"
                       class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors">
              </div>
            </div>

            <!-- Row 2: Author, Category, Price, Pages -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Author / Editor *</label>
                <input type="text" id="new-doc-author" required placeholder="e.g. MH VISION Team" value="MH VISION"
                       class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors">
              </div>

              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Category *</label>
                <select id="new-doc-category" class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors">
                  <option value="Education">Education</option>
                  <option value="Current Affairs">Current Affairs</option>
                  <option value="History">History</option>
                  <option value="Science & Tech">Science & Tech</option>
                  <option value="Competitive Exams">Competitive Exams</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Design & Architecture">Design & Architecture</option>
                  <option value="Economics & Finance">Economics & Finance</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Price (₹ INR) *</label>
                <input type="number" id="new-doc-price" step="1" min="0" required placeholder="299" value="299"
                       class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors">
              </div>

              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Page Count</label>
                <input type="number" id="new-doc-pages" min="1" placeholder="32" value="28"
                       class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors">
              </div>
            </div>

            <!-- Row 3: Abstract -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Publication Summary / Abstract</label>
              <textarea id="new-doc-abstract" rows="3" placeholder="Provide a concise description of the contents and study topics..."
                        class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"></textarea>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-2">
              <button type="submit" class="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>Publish to Catalog</span>
              </button>
            </div>

          </form>
        </div>

        <!-- Section 2: Manage Existing Documents Table / List -->
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <i data-lucide="layers" class="w-4 h-4 text-neutral-700 dark:text-neutral-300"></i>
              </div>
              <div>
                <h2 class="font-serif font-bold text-xl">Manage Active Publications</h2>
                <p class="text-xs text-neutral-500">Edit titles, prices, authors, or delete entries.</p>
              </div>
            </div>
            <span class="text-xs font-mono text-neutral-400">${docs.length} Entries</span>
          </div>

          <!-- Documents Table / Grid -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
                  <th class="py-3 px-3">Cover</th>
                  <th class="py-3 px-3">Title & Subtitle</th>
                  <th class="py-3 px-3">Author</th>
                  <th class="py-3 px-3">Category</th>
                  <th class="py-3 px-3">Price</th>
                  <th class="py-3 px-3">Pages</th>
                  <th class="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-sm">
                ${docs.map(doc => `
                  <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                    
                    <!-- Cover Thumbnail -->
                    <td class="py-3 px-3">
                      <div class="w-9 h-12 rounded flex items-center justify-center text-white text-[8px] font-bold shadow-xs" style="background: ${doc.coverStyle};">
                        PDF
                      </div>
                    </td>

                    <!-- Title -->
                    <td class="py-3 px-3 max-w-xs">
                      <div class="font-serif font-bold text-neutral-900 dark:text-white truncate">${doc.title}</div>
                      <div class="text-xs text-neutral-500 truncate">${doc.subtitle}</div>
                    </td>

                    <!-- Author -->
                    <td class="py-3 px-3 font-medium text-xs whitespace-nowrap">
                      ${doc.author}
                    </td>

                    <!-- Category -->
                    <td class="py-3 px-3 whitespace-nowrap">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        ${doc.category}
                      </span>
                    </td>

                    <!-- Price -->
                    <td class="py-3 px-3 font-mono font-bold whitespace-nowrap">
                      ₹${doc.price}
                    </td>

                    <!-- Pages -->
                    <td class="py-3 px-3 font-mono text-xs text-neutral-500 whitespace-nowrap">
                      ${doc.pages}p
                    </td>

                    <!-- Actions: Edit & Delete -->
                    <td class="py-3 px-3 text-right whitespace-nowrap space-x-2">
                      
                      <!-- Edit Button -->
                      <button onclick="window.handleAdminOpenEdit('${doc.id}')" class="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="Edit Monograph Details">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5 inline mr-1"></i>
                        <span>Edit</span>
                      </button>

                      <!-- Delete Button -->
                      <button onclick="window.handleAdminDeleteDoc('${doc.id}')" class="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" title="Delete Monograph">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5 inline mr-1"></i>
                        <span>Delete</span>
                      </button>

                    </td>

                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </div>

        <!-- Section 3: Admin Security & Password Settings -->
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div class="flex items-center space-x-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
              <i data-lucide="key-round" class="w-4 h-4 text-amber-600 dark:text-amber-400"></i>
            </div>
            <div>
              <h2 class="font-serif font-bold text-xl">Admin Security & Password Settings</h2>
              <p class="text-xs text-neutral-500">Change the master administrator access passcode.</p>
            </div>
          </div>

          <form id="admin-change-pass-form" onsubmit="event.preventDefault(); window.handleAdminChangePassword(event);" class="space-y-4 max-w-xl">
            
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Current Password *</label>
              <input type="password" id="current-pass-input" required placeholder="Enter current admin password"
                     class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">New Password *</label>
                <input type="password" id="new-pass-input" required placeholder="Enter new password"
                       class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white">
              </div>

              <div>
                <label class="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Confirm New Password *</label>
                <input type="password" id="confirm-pass-input" required placeholder="Confirm new password"
                       class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white">
              </div>
            </div>

            <div id="password-change-status" class="text-xs font-mono hidden"></div>

            <div class="pt-2">
              <button type="submit" class="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>Update Master Password</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      <!-- Edit Document Modal Overlay -->
      ${editingDoc ? renderEditDocModal(editingDoc) : ''}

    </div>
  `;
}

function renderEditDocModal(doc) {
  return `
    <div id="edit-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div class="w-full max-w-xl bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6 text-neutral-900 dark:text-neutral-100">
        
        <div class="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 class="font-serif font-bold text-lg">Edit Publication Details</h3>
            <p class="text-xs text-neutral-500 font-mono">ID: ${doc.id}</p>
          </div>
          <button id="close-edit-modal-btn" class="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form id="admin-save-edit-form" onsubmit="event.preventDefault(); window.handleAdminSaveEdit(event, '${doc.id}');" class="space-y-4">
          
          <div>
            <label class="block text-xs font-mono uppercase text-neutral-500 mb-1">Title</label>
            <input type="text" id="edit-doc-title" value="${doc.title.replace(/"/g, '&quot;')}" required
                   class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white">
          </div>

          <div>
            <label class="block text-xs font-mono uppercase text-neutral-500 mb-1">Subtitle</label>
            <input type="text" id="edit-doc-subtitle" value="${(doc.subtitle || '').replace(/"/g, '&quot;')}" required
                   class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-mono uppercase text-neutral-500 mb-1">Author / Editor</label>
              <input type="text" id="edit-doc-author" value="${doc.author.replace(/"/g, '&quot;')}" required
                     class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white">
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-neutral-500 mb-1">Category</label>
              <select id="edit-doc-category" class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white">
                <option value="Education" ${doc.category === 'Education' ? 'selected' : ''}>Education</option>
                <option value="Current Affairs" ${doc.category === 'Current Affairs' ? 'selected' : ''}>Current Affairs</option>
                <option value="History" ${doc.category === 'History' ? 'selected' : ''}>History</option>
                <option value="Science & Tech" ${doc.category === 'Science & Tech' ? 'selected' : ''}>Science & Tech</option>
                <option value="Competitive Exams" ${doc.category === 'Competitive Exams' ? 'selected' : ''}>Competitive Exams</option>
                <option value="Artificial Intelligence" ${doc.category === 'Artificial Intelligence' ? 'selected' : ''}>Artificial Intelligence</option>
                <option value="Design & Architecture" ${doc.category === 'Design & Architecture' ? 'selected' : ''}>Design & Architecture</option>
                <option value="Economics & Finance" ${doc.category === 'Economics & Finance' ? 'selected' : ''}>Economics & Finance</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-mono uppercase text-neutral-500 mb-1">Price (₹ INR)</label>
              <input type="number" id="edit-doc-price" step="1" min="0" value="${doc.price}" required
                     class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white">
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-neutral-500 mb-1">Page Count</label>
              <input type="number" id="edit-doc-pages" min="1" value="${doc.pages}" required
                     class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white">
            </div>
          </div>

          <div>
            <label class="block text-xs font-mono uppercase text-neutral-500 mb-1">Abstract / Summary</label>
            <textarea id="edit-doc-abstract" rows="3"
                      class="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white">${doc.abstract || ''}</textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button type="button" onclick="window.handleAdminCloseEdit()" class="px-5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
            <button type="submit" class="px-6 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}
