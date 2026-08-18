import { DOCUMENTS, CATEGORIES } from './data/documents.js';
import { renderNavbar } from './components/Navbar.js';
import { renderHero } from './components/Hero.js';
import { renderCatalogSection } from './components/CatalogSection.js';
import { renderFeatureHighlight } from './components/FeatureHighlight.js';
import { renderFooter } from './components/Footer.js';
import { renderPaymentModal } from './components/PaymentModal.js';
import { renderPDFReaderModal } from './components/PDFReaderModal.js';
import { renderQuickSearchModal, renderAdminLoginModal, renderUploadPDFModal, renderLibraryDrawer } from './components/Modals.js';
import { renderAdminPanel } from './components/AdminPanel.js';
import { 
  fetchPublications, 
  savePublicationToFirestore, 
  updatePublicationInFirestore, 
  deletePublicationFromFirestore, 
  subscribePublications,
  authenticateAdmin 
} from './services/firebase.js';
import { uploadPDFToCloudinary } from './services/cloudinary.js';

// Application State with Firebase Sync & LocalStorage Cache
const cachedDocs = localStorage.getItem('mh_publications_cache');
const state = {
  documents: cachedDocs ? JSON.parse(cachedDocs) : [...DOCUMENTS],
  selectedCategory: 'All Categories',
  unlockedDocs: JSON.parse(localStorage.getItem('test_unlocked_docs') || '["doc-001"]'),
  activePaymentDocId: null,
  paymentMethod: 'card', // 'card', 'apple', 'demo'
  appliedDiscount: 0,
  activeReaderDocId: null,
  readerCurrentPage: 1,
  readerTheme: 'paper', // 'paper', 'sepia', 'dark', 'oled'
  readerZoom: 100,
  isReaderTocOpen: true,
  isReaderAiOpen: false,
  isSearchOpen: false,
  searchQuery: '',
  isUploadModalOpen: false,
  isLibraryDrawerOpen: false,
  isAdminView: false,
  isAdminAuthModalOpen: false,
  adminPassword: localStorage.getItem('mh_admin_password') || 'admin123',
  editingDocId: null,
  docNotes: JSON.parse(localStorage.getItem('test_doc_notes') || '{}'),
  isUploading: false,
  uploadProgress: 0,
};

// Helper: Cache Documents Locally
function cacheDocuments() {
  localStorage.setItem('mh_publications_cache', JSON.stringify(state.documents));
}

// Sync with Firebase Firestore on Boot
async function initFirebaseSync() {
  try {
    // Initial fetch from Firestore
    const cloudDocs = await fetchPublications();
    if (cloudDocs && cloudDocs.length > 0) {
      state.documents = cloudDocs;
      cacheDocuments();
      renderApp();
    } else {
      // If Firestore collection is empty, seed initial documents
      console.log('Seeding initial publications to Firebase Firestore...');
      for (const doc of DOCUMENTS) {
        await savePublicationToFirestore(doc);
      }
    }

    // Subscribe to live updates across all global clients
    subscribePublications((liveDocs) => {
      if (liveDocs && liveDocs.length > 0) {
        state.documents = liveDocs;
        cacheDocuments();
        renderApp();
      }
    });
  } catch (err) {
    console.warn('Firebase sync initialized in offline/fallback mode:', err);
  }
}

// Main Render Function
function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // If in Admin View Mode
  if (state.isAdminView) {
    appContainer.innerHTML = renderAdminPanel(state);
    if (window.lucide) window.lucide.createIcons();
    attachAdminEventListeners();
    return;
  }

  const activePaymentDoc = state.activePaymentDocId 
    ? state.documents.find(d => d.id === state.activePaymentDocId) 
    : null;
  const activeReaderDoc = state.activeReaderDocId 
    ? state.documents.find(d => d.id === state.activeReaderDocId) 
    : null;

  appContainer.innerHTML = `
    <!-- Top Navigation Bar (Home, Collection, About) -->
    ${renderNavbar(state)}

    <!-- Main Page Layout -->
    <main class="min-h-screen">
      <!-- 1. Hero Section with MH VISION Headline -->
      ${renderHero()}

      <!-- 2. Curated Collection Grid (Centered Header, ₹ INR Pricing) -->
      ${renderCatalogSection(state)}

      <!-- 3. About & Architecture Showcase (Centered Header) -->
      ${renderFeatureHighlight()}
    </main>

    <!-- 4. Dark High-Contrast Centered Footer with Author Credit & Discreet Admin Link -->
    ${renderFooter()}

    <!-- Modals & Overlays -->
    ${activePaymentDoc ? renderPaymentModal(activePaymentDoc, state) : ''}
    ${activeReaderDoc ? renderPDFReaderModal(activeReaderDoc, state) : ''}
    ${state.isSearchOpen ? renderQuickSearchModal(state) : ''}
    ${state.isAdminAuthModalOpen ? renderAdminLoginModal(state) : ''}
    ${state.isUploadModalOpen ? renderUploadPDFModal() : ''}
    ${state.isLibraryDrawerOpen ? renderLibraryDrawer(state) : ''}
  `;

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Attach event listeners
  attachEventListeners();
}

// Global Handlers attached to Window
window.handleOpenDocument = function(docId) {
  if (state.unlockedDocs.includes(docId)) {
    window.handleOpenReader(docId);
  } else {
    state.activePaymentDocId = docId;
    state.paymentMethod = 'card';
    state.appliedDiscount = 0;
    renderApp();
  }
};

window.handleOpenReader = function(docId) {
  state.activeReaderDocId = docId;
  state.readerCurrentPage = 1;
  state.activePaymentDocId = null;
  state.isLibraryDrawerOpen = false;
  state.isSearchOpen = false;
  renderApp();
};

window.handleNewsletterSubmit = function(e) {
  const status = document.getElementById('newsletter-status');
  if (status) {
    status.classList.remove('hidden');
    setTimeout(() => {
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput) emailInput.value = '';
    }, 1500);
  }
};

// Admin Prompt & Security Handlers
window.handlePromptAdminLogin = function() {
  state.isAdminAuthModalOpen = true;
  renderApp();
};

window.handleVerifyAdminPasscode = async function(e) {
  const passcode = document.getElementById('admin-passcode-input').value.trim();
  const errorMsg = document.getElementById('admin-auth-error');

  if (passcode === state.adminPassword) {
    state.isAdminAuthModalOpen = false;
    state.isAdminView = true;
    // Authenticate with Firebase for write permissions
    await authenticateAdmin();
    renderApp();
  } else {
    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      const input = document.getElementById('admin-passcode-input');
      if (input) {
        input.classList.add('border-red-500');
        input.focus();
      }
    }
  }
};

// Change Admin Password Handler
window.handleAdminChangePassword = function(e) {
  const currentPass = document.getElementById('current-pass-input').value.trim();
  const newPass = document.getElementById('new-pass-input').value.trim();
  const confirmPass = document.getElementById('confirm-pass-input').value.trim();
  const statusDiv = document.getElementById('password-change-status');

  if (!statusDiv) return;

  if (currentPass !== state.adminPassword) {
    statusDiv.className = 'text-xs font-mono text-red-500 block';
    statusDiv.textContent = '❌ Current password is incorrect.';
    return;
  }

  if (newPass.length < 4) {
    statusDiv.className = 'text-xs font-mono text-red-500 block';
    statusDiv.textContent = '❌ New password must be at least 4 characters long.';
    return;
  }

  if (newPass !== confirmPass) {
    statusDiv.className = 'text-xs font-mono text-red-500 block';
    statusDiv.textContent = '❌ New password and confirmation do not match.';
    return;
  }

  // Update password
  state.adminPassword = newPass;
  localStorage.setItem('mh_admin_password', newPass);

  statusDiv.className = 'text-xs font-mono text-emerald-500 block';
  statusDiv.textContent = '✓ Master password updated successfully! Use this password on your next login.';

  document.getElementById('current-pass-input').value = '';
  document.getElementById('new-pass-input').value = '';
  document.getElementById('confirm-pass-input').value = '';
};

// Admin Operations Global Handlers
window.handleAdminOpenEdit = function(docId) {
  state.editingDocId = docId;
  renderApp();
};

window.handleAdminCloseEdit = function() {
  state.editingDocId = null;
  renderApp();
};

window.handleAdminSaveEdit = async function(e, docId) {
  const title = document.getElementById('edit-doc-title').value.trim();
  const subtitle = document.getElementById('edit-doc-subtitle').value.trim();
  const author = document.getElementById('edit-doc-author').value.trim();
  const category = document.getElementById('edit-doc-category').value;
  const price = parseFloat(document.getElementById('edit-doc-price').value) || 0;
  const pages = parseInt(document.getElementById('edit-doc-pages').value) || 1;
  const abstract = document.getElementById('edit-doc-abstract').value.trim();

  const updatedFields = {
    title,
    subtitle,
    author,
    category,
    price,
    pages,
    abstract
  };

  const docIndex = state.documents.findIndex(d => d.id === docId);
  if (docIndex !== -1) {
    state.documents[docIndex] = {
      ...state.documents[docIndex],
      ...updatedFields
    };
    cacheDocuments();
    state.editingDocId = null;
    renderApp();

    try {
      await updatePublicationInFirestore(docId, updatedFields);
    } catch (err) {
      console.warn('Saved locally, Firestore update error:', err);
    }
  }
};

window.handleAdminDeleteDoc = async function(docId) {
  if (confirm("Are you sure you want to remove this publication from the live archives?")) {
    state.documents = state.documents.filter(d => d.id !== docId);
    cacheDocuments();
    renderApp();

    try {
      await deletePublicationFromFirestore(docId);
    } catch (err) {
      console.warn('Deleted locally, Firestore delete error:', err);
    }
  }
};

window.handleAdminAddDoc = async function(e) {
  const title = document.getElementById('new-doc-title').value.trim();
  const subtitle = document.getElementById('new-doc-subtitle').value.trim();
  const author = document.getElementById('new-doc-author').value.trim() || 'MH VISION';
  const category = document.getElementById('new-doc-category').value;
  const price = parseFloat(document.getElementById('new-doc-price').value) || 0;
  const pages = parseInt(document.getElementById('new-doc-pages').value) || 24;
  const abstract = document.getElementById('new-doc-abstract').value.trim() || 'New publication added to MH VISION.';

  const fileInput = document.getElementById('admin-file-input');
  const selectedFile = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  let uploadedPdfUrl = null;

  // If a PDF file is attached, upload to Cloudinary with live progress!
  if (selectedFile) {
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Uploading to Cloudinary (0%)...`;
      }

      const uploadResult = await uploadPDFToCloudinary(selectedFile, (progress) => {
        if (submitBtn) {
          submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Uploading to Cloudinary (${progress}%)...`;
        }
      });

      uploadedPdfUrl = uploadResult.secureUrl;
    } catch (uploadError) {
      alert(`⚠️ Cloudinary Upload Notice: ${uploadError.message}. Proceeding with publication metadata.`);
    }
  }

  const gradients = [
    'linear-gradient(135deg, #1C1917 0%, #292524 50%, #44403C 100%)',
    'linear-gradient(135deg, #09090B 0%, #1E1B4B 100%)',
    'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #0F172A 100%)',
    'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
    'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)'
  ];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  const newDocId = 'pub-' + Date.now();
  const newDoc = {
    id: newDocId,
    title,
    subtitle,
    author,
    category,
    price,
    rating: 4.98,
    reviewsCount: 1,
    pages,
    readTime: `${Math.round(pages * 0.8)} min`,
    edition: 'Published Edition · 2026',
    coverStyle: randomGradient,
    accentColor: '#D4AF37',
    badge: 'New Release',
    abstract,
    pdfUrl: uploadedPdfUrl,
    highlights: [
      'Verified publication for Malayalam Knowledge Hub.',
      'Vector typographic scale calibrated.',
      'Cloudinary CDN stream enabled.'
    ],
    tableOfContents: [
      { page: 1, title: 'Chapter 1: Overview & Fundamentals' },
      { page: 2, title: 'Chapter 2: Core Concepts & Practice' },
      { page: 3, title: 'Chapter 3: Analysis & Summary' }
    ],
    pagesContent: [
      {
        pageNumber: 1,
        chapter: 'CHAPTER I',
        title: 'Overview & Fundamentals',
        content: `
          <p class="lead-paragraph text-xl font-serif leading-relaxed mb-6">
            <span class="float-left text-5xl font-bold font-serif leading-none pr-3 pt-1 text-neutral-900 dark:text-neutral-100">${title.charAt(0)}</span>${title.slice(1)} provides essential insights and structured knowledge for learners.
          </p>
          <div class="my-6 p-6 bg-neutral-100/70 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <p class="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">Summary Abstract</p>
            <p class="italic font-serif text-base text-neutral-800 dark:text-neutral-200">${abstract}</p>
          </div>
          <p class="text-base font-serif leading-relaxed">
            Authored by <strong>${author}</strong> for MH VISION Digital Publications.
          </p>
        `
      },
      {
        pageNumber: 2,
        chapter: 'CHAPTER II',
        title: 'Core Concepts & Practice',
        content: `
          <p class="text-base font-serif leading-relaxed mb-6">
            Comprehensive curriculum, analytical formulations, and structured explanations designed for high retention.
          </p>
        `
      },
      {
        pageNumber: 3,
        chapter: 'CHAPTER III',
        title: 'Analysis & Summary',
        content: `
          <p class="text-base font-serif leading-relaxed">
            Synthesized review and self-assessment points to stay ahead in your knowledge journey.
          </p>
        `
      }
    ]
  };

  state.documents.unshift(newDoc);
  cacheDocuments();

  // Save to Firebase Firestore
  try {
    await savePublicationToFirestore(newDoc);
  } catch (firestoreErr) {
    console.warn('Saved locally, Firestore sync error:', firestoreErr);
  }

  alert(`✓ Publication "${title}" has been successfully uploaded to Cloudinary & published live to Firebase!`);
  renderApp();
};

// Admin Event Listeners
function attachAdminEventListeners() {
  const exitBtn = document.getElementById('admin-exit-btn');
  if (exitBtn) {
    exitBtn.onclick = () => {
      state.isAdminView = false;
      renderApp();
    };
  }

  const dropzone = document.getElementById('admin-pdf-dropzone');
  const fileInput = document.getElementById('admin-file-input');
  const fileLabel = document.getElementById('admin-selected-file-label');

  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const titleInput = document.getElementById('new-doc-title');
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        if (titleInput && !titleInput.value) {
          titleInput.value = cleanName;
        }
        if (fileLabel) {
          fileLabel.textContent = `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB) · Ready for Cloudinary`;
          fileLabel.classList.add('text-emerald-500');
        }
      }
    };
  }

  const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
  if (closeEditModalBtn) {
    closeEditModalBtn.onclick = () => {
      state.editingDocId = null;
      renderApp();
    };
  }
}

// User-Facing Event Listeners
function attachEventListeners() {
  
  // Theme toggle
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      document.documentElement.classList.toggle('dark');
      renderApp();
    };
  }

  // Admin Auth Modal Listeners
  const closeAdminAuthBtn = document.getElementById('close-admin-auth-btn');
  const cancelAdminAuthBtn = document.getElementById('cancel-admin-auth-btn');
  const adminAuthBackdrop = document.getElementById('admin-auth-modal-backdrop');

  if (closeAdminAuthBtn) {
    closeAdminAuthBtn.onclick = () => {
      state.isAdminAuthModalOpen = false;
      renderApp();
    };
  }
  if (cancelAdminAuthBtn) {
    cancelAdminAuthBtn.onclick = () => {
      state.isAdminAuthModalOpen = false;
      renderApp();
    };
  }
  if (adminAuthBackdrop) {
    adminAuthBackdrop.onclick = (e) => {
      if (e.target === adminAuthBackdrop) {
        state.isAdminAuthModalOpen = false;
        renderApp();
      }
    };
  }

  const togglePassBtn = document.getElementById('toggle-admin-pass-visibility');
  if (togglePassBtn) {
    togglePassBtn.onclick = () => {
      const passInput = document.getElementById('admin-passcode-input');
      if (passInput) {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
      }
    };
  }

  // Search Modal Triggers
  const searchTriggerBtn = document.getElementById('search-trigger-btn');
  if (searchTriggerBtn) {
    searchTriggerBtn.onclick = () => {
      state.isSearchOpen = true;
      renderApp();
    };
  }

  const closeSearchModalBtn = document.getElementById('close-search-modal-btn');
  if (closeSearchModalBtn) {
    closeSearchModalBtn.onclick = () => {
      state.isSearchOpen = false;
      renderApp();
    };
  }

  const searchBackdrop = document.getElementById('search-modal-backdrop');
  if (searchBackdrop) {
    searchBackdrop.onclick = (e) => {
      if (e.target === searchBackdrop) {
        state.isSearchOpen = false;
        renderApp();
      }
    };
  }

  const searchInput = document.getElementById('search-modal-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.searchQuery = e.target.value;
      renderApp();
      const updatedInput = document.getElementById('search-modal-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
      }
    };
  }

  // Payment Modal Interactions
  const closePaymentModalBtn = document.getElementById('close-payment-modal-btn');
  if (closePaymentModalBtn) {
    closePaymentModalBtn.onclick = () => {
      state.activePaymentDocId = null;
      renderApp();
    };
  }

  document.querySelectorAll('.payment-tab-btn').forEach(btn => {
    btn.onclick = () => {
      state.paymentMethod = btn.dataset.method;
      renderApp();
    };
  });

  const promoBtn = document.getElementById('apply-promo-btn');
  if (promoBtn) {
    promoBtn.onclick = () => {
      const promoInput = document.getElementById('promo-code-input');
      if (promoInput && promoInput.value.trim().toUpperCase() === 'MH100') {
        const doc = state.documents.find(d => d.id === state.activePaymentDocId);
        state.appliedDiscount = doc ? doc.price : 299;
      } else if (promoInput && promoInput.value.trim().toUpperCase() === 'VIP') {
        state.appliedDiscount = 100;
      }
      renderApp();
    };
  }

  // Card Inputs Formatting
  const cardNumberInput = document.getElementById('card-number-input');
  if (cardNumberInput) {
    cardNumberInput.oninput = (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = val;
      const preview = document.getElementById('card-preview-number');
      if (preview) preview.textContent = val || '•••• •••• •••• 4242';
    };
  }

  const cardNameInput = document.getElementById('card-name-input');
  if (cardNameInput) {
    cardNameInput.oninput = (e) => {
      const preview = document.getElementById('card-preview-name');
      if (preview) preview.textContent = e.target.value || 'MH SCHOLAR';
    };
  }

  const cardExpiryInput = document.getElementById('card-expiry-input');
  if (cardExpiryInput) {
    cardExpiryInput.oninput = (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
      const preview = document.getElementById('card-preview-expiry');
      if (preview) preview.textContent = val || '12/28';
    };
  }

  // Payment Confirmation Action
  const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
  if (confirmPaymentBtn) {
    confirmPaymentBtn.onclick = () => {
      const docId = confirmPaymentBtn.dataset.docId;
      executePayment(docId);
    };
  }

  // PDF Reader Modal Controls
  const readerCloseBtn = document.getElementById('reader-close-btn');
  if (readerCloseBtn) {
    readerCloseBtn.onclick = () => {
      state.activeReaderDocId = null;
      renderApp();
    };
  }

  const readerPrevBtn = document.getElementById('reader-prev-page-btn');
  if (readerPrevBtn) {
    readerPrevBtn.onclick = () => {
      if (state.readerCurrentPage > 1) {
        state.readerCurrentPage--;
        renderApp();
      }
    };
  }

  const readerNextBtn = document.getElementById('reader-next-page-btn');
  if (readerNextBtn) {
    readerNextBtn.onclick = () => {
      const doc = state.documents.find(d => d.id === state.activeReaderDocId);
      const maxPages = doc && doc.pagesContent ? doc.pagesContent.length : 1;
      if (state.readerCurrentPage < maxPages) {
        state.readerCurrentPage++;
        renderApp();
      }
    };
  }

  const readerZoomInBtn = document.getElementById('reader-zoom-in-btn');
  if (readerZoomInBtn) {
    readerZoomInBtn.onclick = () => {
      state.readerZoom = Math.min(150, state.readerZoom + 15);
      renderApp();
    };
  }

  const readerZoomOutBtn = document.getElementById('reader-zoom-out-btn');
  if (readerZoomOutBtn) {
    readerZoomOutBtn.onclick = () => {
      state.readerZoom = Math.max(70, state.readerZoom - 15);
      renderApp();
    };
  }

  const readerTocToggleBtn = document.getElementById('reader-toc-toggle-btn');
  if (readerTocToggleBtn) {
    readerTocToggleBtn.onclick = () => {
      state.isReaderTocOpen = !state.isReaderTocOpen;
      renderApp();
    };
  }

  const readerAiToggleBtn = document.getElementById('reader-ai-toggle-btn');
  if (readerAiToggleBtn) {
    readerAiToggleBtn.onclick = () => {
      state.isReaderAiOpen = !state.isReaderAiOpen;
      renderApp();
    };
  }

  const readerCloseAiBtn = document.getElementById('reader-close-ai-btn');
  if (readerCloseAiBtn) {
    readerCloseAiBtn.onclick = () => {
      state.isReaderAiOpen = false;
      renderApp();
    };
  }

  document.querySelectorAll('.reader-theme-btn').forEach(btn => {
    btn.onclick = () => {
      state.readerTheme = btn.dataset.theme;
      renderApp();
    };
  });

  document.querySelectorAll('.reader-toc-item, .reader-thumb-btn').forEach(btn => {
    btn.onclick = () => {
      state.readerCurrentPage = parseInt(btn.dataset.page);
      renderApp();
    };
  });

  // Notes Input in Reader
  const notesInput = document.getElementById('reader-notes-input');
  if (notesInput) {
    notesInput.oninput = (e) => {
      if (state.activeReaderDocId) {
        state.docNotes[state.activeReaderDocId] = e.target.value;
        localStorage.setItem('test_doc_notes', JSON.stringify(state.docNotes));
        const status = document.getElementById('notes-save-status');
        if (status) {
          status.textContent = 'Saved';
          status.classList.remove('opacity-50');
        }
      }
    };
  }
}

// Payment Processing Simulation
function executePayment(docId) {
  const payBtn = document.getElementById('confirm-payment-btn');
  const payText = document.getElementById('pay-btn-text');

  if (!payBtn || !payText) return;

  payBtn.disabled = true;
  payText.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Authorizing & Decrypting Publication...`;

  setTimeout(() => {
    payText.innerHTML = `✓ Payment Approved! Unlocking PDF...`;
    
    // Trigger Canvas Confetti celebration
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Add to unlocked collection
    if (!state.unlockedDocs.includes(docId)) {
      state.unlockedDocs.push(docId);
      localStorage.setItem('test_unlocked_docs', JSON.stringify(state.unlockedDocs));
    }

    setTimeout(() => {
      window.handleOpenReader(docId);
    }, 900);

  }, 1100);
}

// Global Keyboard Shortcuts (Esc to close, Ctrl+K for search, Ctrl+Shift+A for Admin)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.isSearchOpen) {
      state.isSearchOpen = false;
      renderApp();
    } else if (state.isAdminAuthModalOpen) {
      state.isAdminAuthModalOpen = false;
      renderApp();
    } else if (state.editingDocId) {
      state.editingDocId = null;
      renderApp();
    } else if (state.activePaymentDocId) {
      state.activePaymentDocId = null;
      renderApp();
    } else if (state.activeReaderDocId) {
      state.activeReaderDocId = null;
      renderApp();
    }
  }

  // Ctrl+K for Quick Search
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    state.isSearchOpen = !state.isSearchOpen;
    renderApp();
  }

  // Secret Admin Shortcut: Ctrl+Shift+A or Cmd+Shift+A
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    state.isAdminAuthModalOpen = true;
    renderApp();
  }

  // Reader Page Flipping with Arrow Keys
  if (state.activeReaderDocId) {
    if (e.key === 'ArrowLeft' && state.readerCurrentPage > 1) {
      state.readerCurrentPage--;
      renderApp();
    } else if (e.key === 'ArrowRight') {
      const doc = state.documents.find(d => d.id === state.activeReaderDocId);
      const maxPages = doc && doc.pagesContent ? doc.pagesContent.length : 1;
      if (state.readerCurrentPage < maxPages) {
        state.readerCurrentPage++;
        renderApp();
      }
    }
  }
});

// Initial boot & Firebase synchronization
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  initFirebaseSync();
});
renderApp();
initFirebaseSync();
