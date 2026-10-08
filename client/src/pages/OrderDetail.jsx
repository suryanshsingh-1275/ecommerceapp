import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { inr, payForOrder } from '../utils';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [o, setO] = useState(null);
  const load = () => api.get(`/orders/${id}`).then((r) => setO(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { load(); }, [id]);

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;
    try { await api.put(`/orders/${id}/cancel`); toast.success('Order cancelled'); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const pay = async () => {
    try { if (await payForOrder(api, o, user)) toast.success('Payment successful'); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  if (!o) return <p>Loading...</p>;
  const a = o.shippingAddress;
  return (
    