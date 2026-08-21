import { DOCUMENTS, CATEGORIES } from './data/documents.js';
import { renderNavbar } from './components/Navbar.js';
import { renderHero } from './components/Hero.js';
import { renderCatalogSection } from './components/CatalogSection.js';
import { renderFeatureHighlight } from './components/FeatureHighlight.js';
import { renderFooter } from './components/Footer.js';
import { renderPaymentModal } from './components/PaymentModal.js';
import { renderPDFReaderModal } from './components/PDFReaderModal.js';
import { 
  renderQuickSearchModal, 
  renderAdminLoginModal, 
  renderUploadPDFModal, 
  renderLibraryDrawer,
  renderUserAuthModal 
} from './components/Modals.js';
import { renderAdminPanel } from './components/AdminPanel.js';
import { 
  fetchPublications, 
  savePublicationToFirestore, 
  updatePublicationInFirestore, 
  deletePublicationFromFirestore, 
  subscribePublications,
  authenticateAdmin,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  listenToAuthChanges,
  fetchUserPurchases,
  savePurchaseReceipt,
  fetchAppConfig,
  saveAppConfig,
  subscribeUserPurchases,
  syncLocalPurchasesToCloud
} from './services/firebase.js';
import { uploadPDFToCloudinary, detectPdfPageCountFast } from './services/cloudinary.js';

// Application State with Local Cache & Firestore Sync
const cachedDocs = localStorage.getItem('mh_publications_cache');
let initialDocs = [];
try {
  if (cachedDocs) initialDocs = JSON.parse(cachedDocs);
} catch (e) {
  initialDocs = [];
}

const state = {
  documents: Array.isArray(initialDocs) ? initialDocs : [],
  selectedCategory: 'All Categories',
  unlockedDocs: [],
  activePaymentDocId: null,
  appliedDiscount: 0,
  activeReaderDocId: null,
  readerCurrentPage: 1,
  pdfTotalPages: null,
  readerTheme: 'paper', // 'paper', 'sepia', 'dark', 'oled'
  readerZoom: 100,
  isReaderTocOpen: window.innerWidth >= 768,
  isSearchOpen: false,
  searchQuery: '',
  isUploadModalOpen: false,
  isLibraryDrawerOpen: false,
  isAdminView: false,
  isAdminAuthModalOpen: false,
  adminPassword: localStorage.getItem('mh_admin_password') || 'admin123',
  editingDocId: null,
  docNotes: JSON.parse(localStorage.getItem('mh_doc_notes') || '{}'),
  isUploading: false,
  uploadProgress: 0,
  
  // User Authentication & Profile
  currentUser: null,
  isUserAuthModalOpen: false,
  userAuthMode: 'login', // 'login' or 'register'
  isUserMenuOpen: false,
  pendingPurchaseDocId: null, // document waiting for user login before checkout

  // Razorpay Live Gateway Credentials
  razorpayKeyId: localStorage.getItem('mh_razorpay_key_id') || 'rzp_live_TRivf6JAYYTQQT',
  razorpayKeySecret: localStorage.getItem('mh_razorpay_key_secret') || 'JTtie2IYS12BxBOcxF9db73a'
};

// PDF.js In-Memory Document Cache
let loadedPdfDoc = null;
let currentPdfUrl = null;

// Helper: Save Documents to Local Cache
function cacheDocuments() {
  localStorage.setItem('mh_publications_cache', JSON.stringify(state.documents));
}

// Sync with Firebase Firestore & Listen to Global Auth Changes
async function initFirebaseSync() {
  try {
    // 1. Fetch Cloud Config for Razorpay Credentials across all devices
    try {
      const config = await fetchAppConfig();
      if (config && config.keyId) {
        state.razorpayKeyId = config.keyId;
        if (config.secret) state.razorpayKeySecret = config.secret;
        localStorage.setItem('mh_razorpay_key_id', config.keyId);
        if (config.secret) localStorage.setItem('mh_razorpay_key_secret', config.secret);
      }
    } catch (cfgErr) {
      console.warn('App config fetch note:', cfgErr);
    }

    // 2. Fetch Publications Catalog & Auto-Sync any local laptop publications to Firestore Cloud
    if (state.documents && state.documents.length > 0) {
      syncLocalPublicationsToCloud(state.documents);
    }

    const cloudDocs = await fetchPublications();
    if (cloudDocs && Array.isArray(cloudDocs) && cloudDocs.length > 0) {
      state.documents = cloudDocs;
      cacheDocuments();
      renderApp();
    }

    subscribePublications((liveDocs) => {
      if (liveDocs && Array.isArray(liveDocs) && liveDocs.length > 0) {
        state.documents = liveDocs;
        cacheDocuments();
        renderApp();
      }
    });

    // 3. Listen to Firebase Auth state & subscribe to Purchases in real-time across devices
    let purchasesUnsub = null;

    listenToAuthChanges(async (user) => {
      state.currentUser = user;
      if (purchasesUnsub) {
        purchasesUnsub();
        purchasesUnsub = null;
      }

      if (user) {
        // Load account-specific cache exclusively for this user UID
        const userCacheKey = 'mh_unlocked_' + user.uid;
        const cachedUserPurchases = JSON.parse(localStorage.getItem(userCacheKey) || '[]');
        state.unlockedDocs = Array.isArray(cachedUserPurchases) ? cachedUserPurchases : [];

        // Initial fetch by UID and email from Cloud Firestore
        try {
          const cloudPurchases = await fetchUserPurchases(user.uid, user.email);
          if (cloudPurchases && Array.isArray(cloudPurchases)) {
            state.unlockedDocs = cloudPurchases;
            localStorage.setItem(userCacheKey, JSON.stringify(state.unlockedDocs));
          }
        } catch (err) {
          console.warn('Could not sync user cloud purchases:', err);
        }

        // Real-time listener for multi-device sync (e.g. Phone unlocks -> Laptop unlocks instantly!)
        purchasesUnsub = subscribeUserPurchases(user.uid, user.email, (livePurchases) => {
          if (livePurchases && Array.isArray(livePurchases)) {
            state.unlockedDocs = livePurchases;
            localStorage.setItem(userCacheKey, JSON.stringify(livePurchases));
            renderApp();
          }
        });
      } else {
        // SIGNED OUT GUEST: Lock all publications immediately!
        state.unlockedDocs = [];
        if (state.activeReaderDocId) {
          state.activeReaderDocId = null;
        }
      }
      renderApp();
    });

  } catch (err) {
    console.warn('Firebase sync initialized in local-first mode:', err);
  }
}

// Render Real PDF Pages on Canvas via PDF.js (if applicable)
async function renderRealPdfCanvas(doc) {
  if (!doc || !doc.pdfUrl) return;
  const canvas = document.getElementById('pdf-render-canvas');
  const spinner = document.getElementById('pdf-loading-spinner');
  if (!canvas) return;

  try {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      // Load PDF from Cloudinary if not already in memory
      if (!loadedPdfDoc || currentPdfUrl !== doc.pdfUrl) {
        if (spinner) spinner.classList.remove('hidden');
        canvas.classList.add('hidden');
        loadedPdfDoc = await window.pdfjsLib.getDocument(doc.pdfUrl).promise;
        currentPdfUrl = doc.pdfUrl;
        state.pdfTotalPages = loadedPdfDoc.numPages;
        const totalDisplay = document.getElementById('reader-total-pages-display');
        if (totalDisplay) totalDisplay.textContent = loadedPdfDoc.numPages;
      }

      // Render the active page
      const pageNum = Math.min(Math.max(1, state.readerCurrentPage || 1), loadedPdfDoc.numPages);
      const page = await loadedPdfDoc.getPage(pageNum);
      
      const desiredWidth = Math.min(window.innerWidth - 32, 820);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = (desiredWidth / unscaledViewport.width) * ((state.readerZoom || 100) / 100);
      const viewport = page.getViewport({ scale: scale * 1.5 });

      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = `${viewport.width / 1.5}px`;
      canvas.style.height = `${viewport.height / 1.5}px`;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      if (spinner) spinner.classList.add('hidden');
      canvas.classList.remove('hidden');
    }
  } catch (err) {
    console.warn('PDF.js rendering notice:', err);
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
    <!-- Top Navigation Bar (Home, Collection, About, User Auth) -->
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
    ${state.isUserAuthModalOpen ? renderUserAuthModal(state) : ''}
    ${state.isUploadModalOpen ? renderUploadPDFModal() : ''}
    ${state.isLibraryDrawerOpen ? renderLibraryDrawer(state) : ''}
  `;

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Render Real PDF Canvas if reader open and uses canvas fallback
  if (activeReaderDoc && activeReaderDoc.pdfUrl && document.getElementById('pdf-render-canvas')) {
    renderRealPdfCanvas(activeReaderDoc);
  }

  // Attach event listeners
  attachEventListeners();
}

// -------------------------------------------------------------
// USER AUTHENTICATION HANDLERS
// -------------------------------------------------------------
window.handlePromptUserAuth = function(mode = 'login') {
  state.userAuthMode = mode;
  state.isUserAuthModalOpen = true;
  state.isUserMenuOpen = false;
  renderApp();
};

window.handleUserGoogleLogin = async function() {
  const btn = document.getElementById('google-signin-btn');
  const errorMsg = document.getElementById('user-auth-error');

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Connecting to Google...`;
    }

    const authResult = await loginWithGoogle();
    if (authResult.success) {
      state.currentUser = authResult.user;
      state.isUserAuthModalOpen = false;
      
      // Clear unlockedDocs first for account isolation
      state.unlockedDocs = [];
      const userCacheKey = 'mh_unlocked_' + authResult.user.uid;

      // Fetch user purchases from Firestore by UID & email
      try {
        const purchases = await fetchUserPurchases(authResult.user.uid, authResult.user.email);
        if (purchases && Array.isArray(purchases)) {
          state.unlockedDocs = purchases;
          localStorage.setItem(userCacheKey, JSON.stringify(state.unlockedDocs));
        }
      } catch (pErr) {
        console.warn('Could not sync user purchases on login:', pErr);
      }

      // If user was attempting to purchase a document before signing in:
      if (state.pendingPurchaseDocId) {
        const pendingDoc = state.pendingPurchaseDocId;
        state.pendingPurchaseDocId = null;
        if (state.unlockedDocs.includes(pendingDoc)) {
          window.handleOpenReader(pendingDoc);
        } else {
          state.activePaymentDocId = pendingDoc;
          state.appliedDiscount = 0;
        }
      }

      renderApp();
    }
  } catch (err) {
    if (errorMsg) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Continue with Google (1-Click)</span>
      `;
    }
  }
};

window.handleUserEmailAuth = async function(e) {
  const emailInput = document.getElementById('user-auth-email');
  const passInput = document.getElementById('user-auth-password');
  const nameInput = document.getElementById('user-auth-name');
  const errorMsg = document.getElementById('user-auth-error');
  const submitBtn = document.getElementById('user-auth-submit-btn');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passInput ? passInput.value.trim() : '';
  const name = nameInput ? nameInput.value.trim() : '';

  if (!email || !password) return;

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Processing...`;
    }

    let authResult;
    if (state.userAuthMode === 'register') {
      authResult = await registerWithEmail(email, password, name);
    } else {
      authResult = await loginWithEmail(email, password);
    }

    if (authResult.success) {
      state.currentUser = authResult.user;
      state.isUserAuthModalOpen = false;

      // Clear unlockedDocs first for account isolation
      state.unlockedDocs = [];
      const userCacheKey = 'mh_unlocked_' + authResult.user.uid;

      // Fetch user purchases from Firestore by UID & email
      try {
        const purchases = await fetchUserPurchases(authResult.user.uid, authResult.user.email);
        if (purchases && Array.isArray(purchases)) {
          state.unlockedDocs = purchases;
          localStorage.setItem(userCacheKey, JSON.stringify(state.unlockedDocs));
        }
      } catch (pErr) {
        console.warn('Could not sync user purchases on login:', pErr);
      }

      // If user was attempting to purchase a document before signing in:
      if (state.pendingPurchaseDocId) {
        const pendingDoc = state.pendingPurchaseDocId;
        state.pendingPurchaseDocId = null;
        if (state.unlockedDocs.includes(pendingDoc)) {
          window.handleOpenReader(pendingDoc);
        } else {
          state.activePaymentDocId = pendingDoc;
          state.appliedDiscount = 0;
        }
      }

      renderApp();
    }
  } catch (err) {
    if (errorMsg) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${state.userAuthMode === 'register' ? 'Create Account' : 'Sign In'}</span>`;
    }
  }
};

window.handleUserSignOut = async function() {
  try {
    await logoutUser();
  } catch (err) {
    console.error('Sign out error:', err);
  }
  state.currentUser = null;
  state.unlockedDocs = [];
  state.activeReaderDocId = null;
  state.isUserMenuOpen = false;
  state.isLibraryDrawerOpen = false;
  renderApp();
};

window.handleOpenLibraryDrawer = function() {
  state.isUserMenuOpen = false;
  state.isLibraryDrawerOpen = true;
  renderApp();
};

// -------------------------------------------------------------
// RAZORPAY LIVE PAYMENT GATEWAY & INSTANT UNLOCK
// -------------------------------------------------------------
window.handleOpenDocument = function(docId) {
  // If document is already unlocked, open reader directly
  if (state.unlockedDocs.includes(docId)) {
    window.handleOpenReader(docId);
    return;
  }

  // If user is NOT logged in, require sign in first
  if (!state.currentUser) {
    state.pendingPurchaseDocId = docId;
    window.handlePromptUserAuth('login');
    return;
  }

  // If user is logged in, open the checkout payment modal
  state.activePaymentDocId = docId;
  state.appliedDiscount = 0;
  renderApp();
};

window.handleInitiateRazorpay = function(docId) {
  const doc = state.documents.find(d => d.id === docId);
  if (!doc) return;

  // Verify authentication
  if (!state.currentUser) {
    state.pendingPurchaseDocId = docId;
    window.handlePromptUserAuth('login');
    return;
  }

  const discount = state.appliedDiscount || 0;
  const finalPrice = Math.max(0, doc.price - discount);

  // If 100% discount promo code was used (₹0)
  if (finalPrice === 0) {
    executeInstantFreeUnlock(doc);
    return;
  }

  if (!window.Razorpay) {
    alert('Razorpay Checkout SDK is loading. Please check your internet connection and try again.');
    return;
  }

  const payBtn = document.getElementById('confirm-razorpay-btn');
  const payText = document.getElementById('pay-btn-text');
  if (payBtn && payText) {
    payBtn.disabled = true;
    payText.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Opening Razorpay Checkout...`;
  }

  // Prefill contact number to prevent Razorpay from asking for phone number
  const prefillPhone = (state.currentUser && state.currentUser.phone) 
    ? state.currentUser.phone 
    : '9876543210';

  const options = {
    key: state.razorpayKeyId || 'rzp_live_TRivf6JAYYTQQT',
    amount: Math.round(finalPrice * 100), // Amount in paise (1 INR = 100 paise)
    currency: 'INR',
    name: 'MH VISION',
    description: `${doc.title} · Malayalam Knowledge Hub`,
    image: 'assets/logo.jpg',
    prefill: {
      name: state.currentUser.displayName || 'Scholar Member',
      email: state.currentUser.email || '',
      contact: prefillPhone
    },
    notes: {
      docId: doc.id,
      docTitle: doc.title,
      userId: state.currentUser.uid,
      userEmail: state.currentUser.email
    },
    theme: {
      color: '#111111'
    },
    handler: async function (response) {
      console.log('Razorpay live payment approved:', response);
      const paymentId = response.razorpay_payment_id;

      if (payText) {
        payText.innerHTML = `✓ Payment Confirmed! Unlocking PDF...`;
      }

      // 1. Add publication to unlocked list for this specific logged-in user account
      if (!state.unlockedDocs.includes(doc.id)) {
        state.unlockedDocs.push(doc.id);
        if (state.currentUser && state.currentUser.uid) {
          localStorage.setItem('mh_unlocked_' + state.currentUser.uid, JSON.stringify(state.unlockedDocs));
        }
      }

      // 2. Save verified purchase receipt in Firestore
      try {
        await savePurchaseReceipt({
          docId: doc.id,
          title: doc.title,
          price: finalPrice,
          paymentId: paymentId,
          gateway: 'razorpay',
          userId: state.currentUser.uid,
          userEmail: state.currentUser.email
        });
      } catch (receiptErr) {
        console.warn('Firestore receipt note:', receiptErr);
      }

      // 3. Trigger celebration confetti
      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      // 4. Close payment modal & automatically open the PDF Reader!
      state.activePaymentDocId = null;
      renderApp();

      setTimeout(() => {
        window.handleOpenReader(doc.id);
      }, 700);
    },
    modal: {
      ondismiss: function() {
        if (payBtn && payText) {
          payBtn.disabled = false;
          payText.innerHTML = `Pay ₹${finalPrice.toFixed(2)} with Razorpay & Unlock`;
        }
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (response) {
    console.error('Razorpay Payment Failed:', response.error);
    alert(`Payment could not be completed: ${response.error.description || 'Declined by bank'}`);
    if (payBtn && payText) {
      payBtn.disabled = false;
      payText.innerHTML = `Pay ₹${finalPrice.toFixed(2)} with Razorpay & Unlock`;
    }
  });

  rzp.open();
};

// Instant Free / 100% Promo Code Unlock
async function executeInstantFreeUnlock(doc) {
  if (!state.unlockedDocs.includes(doc.id)) {
    state.unlockedDocs.push(doc.id);
    if (state.currentUser && state.currentUser.uid) {
      localStorage.setItem('mh_unlocked_' + state.currentUser.uid, JSON.stringify(state.unlockedDocs));
    }
  }

  try {
    await savePurchaseReceipt({
      docId: doc.id,
      title: doc.title,
      price: 0,
      paymentId: 'PROMO_FREE_ACCESS',
      gateway: 'promo',
      userId: state.currentUser.uid,
      userEmail: state.currentUser.email
    });
  } catch (err) {}

  if (window.confetti) {
    window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  state.activePaymentDocId = null;
  renderApp();

  setTimeout(() => {
    window.handleOpenReader(doc.id);
  }, 600);
}

// -------------------------------------------------------------
// GLOBAL PUBLICATION & MODAL HANDLERS
// -------------------------------------------------------------
window.handleOpenReader = function(docId) {
  state.activeReaderDocId = docId;
  state.readerCurrentPage = 1;
  state.activePaymentDocId = null;
  state.isLibraryDrawerOpen = false;
  state.isSearchOpen = false;
  // On mobile screens, default TOC sidebar to collapsed so 100% of viewport is full-screen PDF
  state.isReaderTocOpen = window.innerWidth >= 768;
  loadedPdfDoc = null;
  currentPdfUrl = null;
  renderApp();
};

window.handleToggleReaderToc = function() {
  state.isReaderTocOpen = !state.isReaderTocOpen;
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

window.handleTogglePass = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    if (btn) {
      btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" class="w-4 h-4"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
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

  state.adminPassword = newPass;
  localStorage.setItem('mh_admin_password', newPass);

  statusDiv.className = 'text-xs font-mono text-emerald-500 block';
  statusDiv.textContent = '✓ Master password updated successfully! Use this password on your next login.';

  document.getElementById('current-pass-input').value = '';
  document.getElementById('new-pass-input').value = '';
  document.getElementById('confirm-pass-input').value = '';
};

// Save Razorpay Keys Handler with Cloud Sync
window.handleAdminSaveRazorpayKeys = async function(e) {
  const keyIdInput = document.getElementById('razorpay-key-id-input');
  const secretInput = document.getElementById('razorpay-key-secret-input');
  const statusDiv = document.getElementById('razorpay-save-status');

  const keyId = keyIdInput ? keyIdInput.value.trim() : '';
  const secret = secretInput ? secretInput.value.trim() : '';

  if (!keyId) return;

  state.razorpayKeyId = keyId;
  state.razorpayKeySecret = secret;

  localStorage.setItem('mh_razorpay_key_id', keyId);
  localStorage.setItem('mh_razorpay_key_secret', secret);

  try {
    await saveAppConfig({ keyId, secret });
    if (statusDiv) {
      statusDiv.className = 'text-xs font-mono text-emerald-500 block';
      statusDiv.textContent = '✓ Live Razorpay API credentials saved to Cloud Database! All mobile & desktop devices updated.';
    }
  } catch (err) {
    if (statusDiv) {
      statusDiv.className = 'text-xs font-mono text-amber-500 block';
      statusDiv.textContent = '✓ Saved locally to browser cache.';
    }
  }
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
      console.warn('Updated locally, Firestore notice:', err);
    }
  }
};

window.handleAdminDeleteDoc = async function(docId) {
  if (confirm("Are you sure you want to remove this publication from the archives?")) {
    state.documents = state.documents.filter(d => d.id !== docId);
    cacheDocuments();
    renderApp();

    try {
      await deletePublicationFromFirestore(docId);
    } catch (err) {
      console.warn('Deleted locally, Firestore notice:', err);
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
  const abstract = document.getElementById('new-doc-abstract').value.trim() || 'Official publication released by MH VISION.';

  const fileInput = document.getElementById('admin-file-input');
  const selectedFile = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  let uploadedPdfUrl = null;

  // Upload to Cloudinary if file attached
  let uploadResult = null;
  if (selectedFile) {
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Uploading to Cloudinary (0%)...`;
      }

      uploadResult = await uploadPDFToCloudinary(selectedFile, (progress) => {
        if (submitBtn) {
          submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Uploading to Cloudinary (${progress}%)...`;
        }
      });

      uploadedPdfUrl = uploadResult.secureUrl;
    } catch (uploadError) {
      alert(`⚠️ Cloudinary Upload: ${uploadError.message}`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4"></i> <span>Publish to Catalog</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
      return;
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

  const finalPages = (uploadResult && uploadResult.pages) ? uploadResult.pages : pages;

  const newDocId = 'pub-' + Date.now();
  const newDoc = {
    id: newDocId,
    title,
    subtitle,
    author,
    category,
    price,
    rating: 5.0,
    reviewsCount: 1,
    pages: finalPages,
    readTime: `${Math.round(finalPages * 0.8)} min`,
    edition: 'Official Edition · 2026',
    coverStyle: randomGradient,
    accentColor: '#D4AF37',
    badge: 'New Release',
    abstract,
    publicId: uploadResult ? uploadResult.publicId : null,
    pdfUrl: uploadedPdfUrl,
    highlights: [
      'Verified study material for Malayalam Knowledge Hub learners.',
      'High-resolution PDF calibrated for deep focus.',
      'Cloud CDN streaming enabled.'
    ],
    tableOfContents: [
      { page: 1, title: 'Page 1: Document Cover & Overview' },
      { page: 2, title: 'Page 2: Chapter Details' },
      { page: 3, title: 'Page 3: Core Study Material' }
    ]
  };

  // Add to active state
  state.documents.unshift(newDoc);
  cacheDocuments();

  // Save to Firebase Firestore
  try {
    await savePublicationToFirestore(newDoc);
  } catch (firestoreErr) {
    console.warn('Saved to local storage, Firestore sync notice:', firestoreErr);
  }

  // Ask admin if they want to view on live homepage
  const viewNow = confirm(`✓ "${title}" has been published!\n\nClick OK to view it on the homepage, or Cancel to stay in the Admin Panel.`);
  if (viewNow) {
    state.isAdminView = false;
  }
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
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const titleInput = document.getElementById('new-doc-title');
        const pagesInput = document.getElementById('new-doc-pages');
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        if (titleInput && !titleInput.value) {
          titleInput.value = cleanName;
        }

        // Fast & Non-blocking page count detection
        const detectedPages = await detectPdfPageCountFast(file);
        if (pagesInput) {
          pagesInput.value = detectedPages;
        }

        if (fileLabel) {
          fileLabel.textContent = `✓ Attached: ${file.name} (${detectedPages} Pages · ${(file.size / 1024).toFixed(1)} KB)`;
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

  // User Menu Toggle
  const userMenuBtn = document.getElementById('user-menu-btn');
  if (userMenuBtn) {
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      state.isUserMenuOpen = !state.isUserMenuOpen;
      renderApp();
    };
  }

  // Close User Menu when clicking outside
  document.addEventListener('click', (e) => {
    if (state.isUserMenuOpen && !e.target.closest('#user-menu-btn') && !e.target.closest('#user-dropdown-menu')) {
      state.isUserMenuOpen = false;
      renderApp();
    }
  });

  // User Auth Modal Listeners
  const closeUserAuthBtn = document.getElementById('close-user-auth-btn');
  const userAuthBackdrop = document.getElementById('user-auth-modal-backdrop');

  if (closeUserAuthBtn) {
    closeUserAuthBtn.onclick = () => {
      state.isUserAuthModalOpen = false;
      renderApp();
    };
  }
  if (userAuthBackdrop) {
    userAuthBackdrop.onclick = (e) => {
      if (e.target === userAuthBackdrop) {
        state.isUserAuthModalOpen = false;
        renderApp();
      }
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
    togglePassBtn.onclick = () => window.handleTogglePass('admin-passcode-input', togglePassBtn);
  }

  const toggleUserPassBtn = document.getElementById('toggle-user-pass-visibility');
  if (toggleUserPassBtn) {
    toggleUserPassBtn.onclick = () => window.handleTogglePass('user-auth-password', toggleUserPassBtn);
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

  // Library Drawer Listeners
  const closeLibraryDrawerBtn = document.getElementById('close-library-drawer-btn');
  const libraryDrawerBackdrop = document.getElementById('library-drawer-backdrop');

  if (closeLibraryDrawerBtn) {
    closeLibraryDrawerBtn.onclick = () => {
      state.isLibraryDrawerOpen = false;
      renderApp();
    };
  }
  if (libraryDrawerBackdrop) {
    libraryDrawerBackdrop.onclick = (e) => {
      if (e.target === libraryDrawerBackdrop) {
        state.isLibraryDrawerOpen = false;
        renderApp();
      }
    };
  }

  // Payment Modal Close Listener
  const closePaymentModalBtn = document.getElementById('close-payment-modal-btn');
  if (closePaymentModalBtn) {
    closePaymentModalBtn.onclick = () => {
      state.activePaymentDocId = null;
      renderApp();
    };
  }

  // Reader Modal TOC button
  const readerTocBtn = document.getElementById('reader-toc-toggle-btn');
  if (readerTocBtn) {
    readerTocBtn.onclick = () => window.handleToggleReaderToc();
  }

  // PDF Reader Modal Controls
  const readerCloseBtn = document.getElementById('reader-close-btn');
  if (readerCloseBtn) {
    readerCloseBtn.onclick = () => {
      state.activeReaderDocId = null;
      loadedPdfDoc = null;
      currentPdfUrl = null;
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
      const maxPages = state.pdfTotalPages || 1;
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

  document.querySelectorAll('.reader-theme-btn').forEach(btn => {
    btn.onclick = () => {
      state.readerTheme = btn.dataset.theme;
      renderApp();
    };
  });

  document.querySelectorAll('.reader-toc-item, .reader-thumb-btn').forEach(btn => {
    btn.onclick = () => {
      state.readerCurrentPage = parseInt(btn.dataset.page);
      if (window.innerWidth < 768) {
        state.isReaderTocOpen = false;
      }
      renderApp();
    };
  });

  // Anti-Screenshot Shield Click to Resume
  const securityShield = document.getElementById('reader-security-shield');
  if (securityShield) {
    securityShield.onclick = () => {
      securityShield.classList.add('hidden');
      securityShield.classList.remove('flex');
    };
  }
}

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.isSearchOpen) {
      state.isSearchOpen = false;
      renderApp();
    } else if (state.isUserAuthModalOpen) {
      state.isUserAuthModalOpen = false;
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
      loadedPdfDoc = null;
      currentPdfUrl = null;
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

  // DRM Protection: Reader Active Keyboard Restrictions
  if (state.activeReaderDocId) {
    // Block Print (Ctrl+P / Cmd+P)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      alert('🔒 Printing is disabled to protect MH VISION publications.');
      return false;
    }

    // Block Save (Ctrl+S / Cmd+S)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      return false;
    }

    // Block View Source (Ctrl+U)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      return false;
    }

    // Block Inspect Element (F12 or Ctrl+Shift+I/J/C)
    if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
      e.preventDefault();
      return false;
    }

    // Reader Page Flipping with Arrow Keys
    if (e.key === 'ArrowLeft' && state.readerCurrentPage > 1) {
      state.readerCurrentPage--;
      renderApp();
    } else if (e.key === 'ArrowRight') {
      const maxPages = state.pdfTotalPages || 1;
      if (state.readerCurrentPage < maxPages) {
        state.readerCurrentPage++;
        renderApp();
      }
    }
  }
});

// Anti-Screenshot & Snipping Tool Defense: Window Loss of Focus
window.addEventListener('blur', () => {
  if (state.activeReaderDocId) {
    const shield = document.getElementById('reader-security-shield');
    if (shield) {
      shield.classList.remove('hidden');
      shield.classList.add('flex');
    }
  }
});

window.addEventListener('focus', () => {
  if (state.activeReaderDocId) {
    const shield = document.getElementById('reader-security-shield');
    if (shield) {
      shield.classList.add('hidden');
      shield.classList.remove('flex');
    }
  }
});

// Anti-Screenshot Defense: PrintScreen Key Interception & Clipboard Wipe
window.addEventListener('keyup', (e) => {
  if (state.activeReaderDocId && (e.key === 'PrintScreen' || e.keyCode === 44)) {
    const shield = document.getElementById('reader-security-shield');
    if (shield) {
      shield.classList.remove('hidden');
      shield.classList.add('flex');
      setTimeout(() => {
        shield.classList.add('hidden');
        shield.classList.remove('flex');
      }, 2500);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('Protected Content — MH VISION Publications');
      }
    } catch (err) {}
  }
});

// Prevent Right-Click Context Menu in Reader
window.addEventListener('contextmenu', (e) => {
  if (state.activeReaderDocId) {
    e.preventDefault();
    return false;
  }
});

// Initial boot & Firebase synchronization
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  initFirebaseSync();
});
renderApp();
initFirebaseSync();
