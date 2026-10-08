import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';
import { inr } from '../../utils';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = () =>
    api.get('/orders', { params: { status: status || undefined, page } }).then((r) => { setOrders(r.data.orders); setPages(r.data.pages); });
  useEffect(() => { load(); }, [status, page]);

  const update = async (id, s) => {
    try { await api.put(`/orders/${id}/status`, { status: s }); toast.success('Status updated'); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="card">
      <div className="row between">
        <h3>Orders</h3>
        <select style={{ width: 180 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td><Link to={`/orders/${o._id}`}>#{o._id.slice(-8)}</Link></td>
              <td>{o.user?.name}<br /><small>{o.user?.email}</small></td>
              <td>{inr(o.totalPrice)}</td>
              <td>{o.paymentMethod} · <span className={`badge ${o.paymentStatus}`}>{o.paymentStatus}</span></td>
              <td><span className={`badge ${o.status}`}>{o.status}</span></td>
              <td>
                <select disabled={['Delivered', 'Cancelled'].includes(o.status)} value={o.status} onChange={(e) => update(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
        <button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} / {pages || 1}</span>
        <button className="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}