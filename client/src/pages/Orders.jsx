import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { inr } from '../utils';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pays, setPays] = useState([]);
  useEffect(() => {
    api.get('/orders/mine').then((r) => setOrders(r.data));
    api.get('/payments/history').then((r) => setPays(r.data));
  }, []);
  return (
    <>
      <div className="card">
        <h2>My orders</h2>
        {!orders.length && <p>No orders yet.</p>}
        <table>
          <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td><Link to={`/orders/${o._id}`}>#{o._id.slice(-8)}</Link></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{inr(o.totalPrice)}</td>
                <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                <td><span className={`badge ${o.paymentStatus}`}>{o.paymentStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Transaction history</h3>
        {!pays.length && <p>No transactions.</p>}
        <table>
          <thead><tr><th>Date</th><th>Gateway ref</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {pays.map((p) => (
              <tr key={p._id}>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>{p.gatewayPaymentId || p.gatewayOrderId}</td>
                <td>{inr(p.amount)}</td>
                <td><span className={`badge ${p.status === 'paid' ? 'Paid' : p.status === 'failed' ? 'Cancelled' : ''}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}