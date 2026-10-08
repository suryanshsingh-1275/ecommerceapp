import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from './AuthContext';

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  const refresh = useCallback(async () => {
    if (!user) return setCart({ items: [] });
    try { setCart((await api.get('/cart')).data); } catch { /* ignore */ }
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);

  const run = async (fn, okMsg) => {
    try { setCart((await fn()).data); if (okMsg) toast.success(okMsg); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const add = (productId, qty = 1) => run(() => api.post('/cart', { productId, qty }), 'Added to cart');
  const setQty = (productId, qty) => run(() => api.put(`/cart/${productId}`, { qty }));
  const remove = (productId) => run(() => api.delete(`/cart/${productId}`));

  const count = cart.items.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.items.reduce((s, i) => s + i.qty * i.product.price, 0);

  return <Ctx.Provider value={{ cart, count, subtotal, add, setQty, remove, refresh }}>{children}</Ctx.Provider>;
}