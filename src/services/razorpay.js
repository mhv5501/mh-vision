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
 * Initiates Razorpay payment directly into payment selection
 * @param {object} pdf - PDF object { id, title, price, ... }
 * @param {object} user - Logged in user object { uid, email, displayName, phoneNumber }
 * @param {function} onSuccess - Callback when payment succeeds
 * @param {function} onError - Callback when payment fails or cancels
 */
export const openRazorpayPayment = async ({ pdf, user, onSuccess, onError }) => {
  const loaded = await loadRazorpaySdk();

  if (!loaded || !window.Razorpay) {
    const error = new Error("Razorpay payment gateway script could not be loaded. Please check your internet connection.");
    alert(error.message);
    if (onError) onError(error);
    return;
  }

  const amountInPaisa = Math.round(Number(pdf.price) * 100);
  const userContact = user?.phoneNumber || "9496001234";

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amountInPaisa,
    currency: "INR",
    name: "MH VISION",
    description: `Unlock PDF: ${pdf.title}`,
    image: "/logo.jpg",
    prefill: {
      name: user?.displayName || user?.email?.split('@')[0] || "Customer",
      email: user?.email || "customer@mhvision.com",
      contact: userContact
    },
    readonly: {
      contact: true,
      email: true,
      name: true
    },
    theme: {
      color: "#0ea5e9"
    },
    config: {
      display: {
        blocks: {
          banks: {
            name: "Select Payment Method",
            instruments: [
              { method: "upi" },
              { method: "netbanking" },
              { method: "card" }
            ]
          }
        },
        sequence: ["block.banks"],
        preferences: {
          show_default_blocks: true
        }
      }
    },
    handler: async function (response) {
      try {
        const paymentId = response.razorpay_payment_id;
        await recordPurchase(user.uid, user.email, pdf.id, pdf.price, paymentId);
        if (onSuccess) onSuccess({ paymentId, pdf });
      } catch (err) {
        console.error("Error saving purchase to database:", err);
        if (onError) onError(err);
      }
    },
    modal: {
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
