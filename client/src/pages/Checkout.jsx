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
    