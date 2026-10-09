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
export async function payForOrder(api, order, user) {
  const { data: g } = await api.post(`/payments/create/${order._id}`);
  if (g.keyId === 'mock') {
    await api.post('/payments/verify', { razorpay_order_id: g.gatewayOrderId, razorpay_payment_id: 'mock_pay', razorpay_signature: 'mock' });
    return true;
  }
  if (!(await loadRzp())) throw new Error('Could not load payment gateway');
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: g.keyId, amount: g.amount, currency: g.currency, order_id: g.gatewayOrderId, name: 'ShopHub',
      prefill: { name: user.name, email: user.email },
      handler: async (r) => {
        try { await api.post('/payments/verify', r); resolve(true); } catch (e) { reject(e); }
      },
      modal: { ondismiss: () => resolve(false) },
    });
    rz.open();
  });
}