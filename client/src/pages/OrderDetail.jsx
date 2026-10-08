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
    <div className="card">
      <div className="row between">
        <h2>Order #{o._id.slice(-8)}</h2>
        <span className={`badge ${o.status}`}>{o.status}</span>
      </div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 2, minWidth: 280 }}>
          <table>
            <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              {o.items.map((i) => (
                <tr key={i._id}><td>{i.name}</td><td>{inr(i.price)}</td><td>{i.qty}</td><td>{inr(i.price * i.qty)}</td></tr>
              ))}
            </tbody>
          </table>
          <p>Items {inr(o.itemsPrice)} · Discount -{inr(o.discount)}{o.couponCode && ` (${o.couponCode})`} · Shipping {inr(o.shippingPrice)}</p>
          <h3>Total {inr(o.totalPrice)}</h3>
          <p>Payment: {o.paymentMethod} — <span className={`badge ${o.paymentStatus}`}>{o.paymentStatus}</span></p>
          <p>Ship to: {a.name}, {a.line1}, {a.city}, {a.state} - {a.pincode}, {a.phone}</p>
          <div className="row">
            {o.paymentMethod === 'ONLINE' && o.paymentStatus === 'Pending' && o.status !== 'Cancelled' && <button onClick={pay}>Pay now</button>}
            {['Pending', 'Confirmed'].includes(o.status) && <button className="danger" onClick={cancel}>Cancel order</button>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h4>Tracking</h4>
          <div className="tl">
            {o.statusHistory.map((h, i) => (
              <div key={i}><b>{h.status}</b><br /><small>{new Date(h.at).toLocaleString()}</small></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}