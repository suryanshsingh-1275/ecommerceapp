import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { inr, payForOrder } from '../utils';

const blank = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  const { user, setUser } = useAuth();
  const { cart, subtotal, refresh } = useCart();
  const nav = useNavigate();
  const [sel, setSel] = useState(user.addresses[0]?._id || 'new');
  const [form, setForm] = useState(blank);
  const [method, setMethod] = useState('COD');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!cart.items.length) nav('/cart'); }, [cart.items.length]);

  const applyCode = async () => {
    try {
      const { data } = await api.post('/coupons/validate', { code, amount: subtotal });
      setDiscount(data.discount);
      toast.success('Coupon applied');
    } catch (e) { setDiscount(0); toast.error(errMsg(e)); }
  };

  const shipping = subtotal - discount >= 999 ? 0 : 49;
  const total = subtotal - discount + shipping;

  const place = async () => {
    setBusy(true);
    try {
      let address = user.addresses.find((a) => a._id === sel);
      if (sel === 'new') {
        const { data } = await api.post('/users/addresses', form);
        setUser({ ...user, addresses: data });
        address = data[data.length - 1];
      }
      const { data: order } = await api.post('/orders', { address, paymentMethod: method, couponCode: discount ? code : undefined });
      await refresh();
      if (method === 'ONLINE') {
        try { (await payForOrder(api, order, user)) ? toast.success('Payment successful') : toast('Payment pending — pay from your orders page'); }
        catch (e) { toast.error(errMsg(e)); }
      } else toast.success('Order placed');
      nav(`/orders/${order._id}`);
    } catch (e) { toast.error(errMsg(e)); }
    setBusy(false);
  };

  return (
    <div className="layout" style={{ gridTemplateColumns: '1fr 320px' }}>
      <div className="card">
        <h3>Shipping address</h3>
        {user.addresses.map((a) => (
          <label key={a._id} style={{ color: '#111' }}>
            <input type="radio" style={{ width: 'auto' }} checked={sel === a._id} onChange={() => setSel(a._id)} />{' '}
            {a.name}, {a.line1}, {a.city}, {a.state} - {a.pincode} ({a.phone})
          </label>
        ))}
        <label style={{ color: '#111' }}>
          <input type="radio" style={{ width: 'auto' }} checked={sel === 'new'} onChange={() => setSel('new')} /> Add new address
        </label>
        {sel === 'new' && Object.keys(blank).map((k) => (
          <div key={k}>
            <label>{k}</label>
            <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </div>
        ))}
        <h3>Payment</h3>
        <label style={{ color: '#111' }}><input type="radio" style={{ width: 'auto' }} checked={method === 'COD'} onChange={() => setMethod('COD')} /> Cash on delivery</label>
        <label style={{ color: '#111' }}><input type="radio" style={{ width: 'auto' }} checked={method === 'ONLINE'} onChange={() => setMethod('ONLINE')} /> Pay online (Razorpay)</label>
      </div>
      <div className="card" style={{ alignSelf: 'start' }}>
        <h3>Summary</h3>
        <div className="row between"><span>Items</span><span>{inr(subtotal)}</span></div>
        <div className="row between"><span>Discount</span><span>-{inr(discount)}</span></div>
        <div className="row between"><span>Shipping</span><span>{shipping ? inr(shipping) : 'Free'}</span></div>
        <hr />
        <div className="row between"><b>Total</b><b>{inr(total)}</b></div>
        <div className="row" style={{ margin: '12px 0' }}>
          <input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: 1 }} />
          <button className="secondary" onClick={applyCode}>Apply</button>
        </div>
        <button style={{ width: '100%' }} disabled={busy} onClick={place}>{busy ? 'Placing...' : 'Place order'}</button>
      </div>
    </div>
  );
}