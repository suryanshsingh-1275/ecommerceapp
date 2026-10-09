export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const loadRzp = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// Creates a gateway order, opens checkout (or mock-pays), verifies. Resolves true if paid.
