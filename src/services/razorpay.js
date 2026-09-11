import { recordPurchase } from './pdfStore';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TRivf6JAYYTQQT';

/**
 * Dynamically loads Razorpay Checkout SDK script if not already present
 * @returns {Promise<boolean>}
 */
export const loadRazorpaySdk = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Clears Razorpay stored checkout sessions from browser localStorage/sessionStorage
 */
const clearRazorpayClientCache = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.toLowerCase().includes('rzp') || key.toLowerCase().includes('razorpay'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.toLowerCase().includes('rzp') || key.toLowerCase().includes('razorpay'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (e) {
    console.warn("Could not clear local storage cache:", e);
  }
};

/**
 * Initiates standard Razorpay payment with fresh customer prompt
 * @param {object} pdf - PDF object { id, title, price, ... }
 * @param {function} onSuccess - Callback when payment succeeds
 * @param {function} onError - Callback when payment fails or cancels
 */
export const openRazorpayPayment = async ({ pdf, onSuccess, onError }) => {
  // Clear any cached dummy phone session
  clearRazorpayClientCache();

  const loaded = await loadRazorpaySdk();

  if (!loaded || !window.Razorpay) {
    const error = new Error("Razorpay payment gateway script could not be loaded. Please check your internet connection.");
    alert(error.message);
    if (onError) onError(error);
    return;
  }

  const amountInPaisa = Math.round(Number(pdf.price) * 100);

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amountInPaisa,
    currency: "INR",
    name: "MH VISION",
    description: `Buy & Download: ${pdf.title}`,
    image: "/logo.jpg",
    payment_capture: 1,
    theme: {
      color: "#0ea5e9"
    },
    // Explicitly enforce that no field is readonly
    readonly: {
      contact: false,
      email: false,
      name: false
    },
    handler: async function (response) {
      try {
        const paymentId = response.razorpay_payment_id;
        await recordPurchase('guest_user', 'guest@mhvision.com', pdf.id, pdf.price, paymentId);
        if (onSuccess) onSuccess({ paymentId, pdf });
      } catch (err) {
        console.error("Error saving purchase analytics:", err);
        if (onSuccess) onSuccess({ paymentId: response.razorpay_payment_id, pdf });
      }
    },
    modal: {
      confirm_close: true,
      ondismiss: function () {
        if (onError) onError(new Error("Payment cancelled by user"));
      }
    }
  };

  try {
    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on('payment.failed', function (response) {
      console.error("Payment failed:", response.error);
      if (onError) onError(new Error(response.error.description || "Payment Failed"));
    });
    razorpayInstance.open();
  } catch (err) {
    console.error("Razorpay instance error:", err);
    if (onError) onError(err);
  }
};
