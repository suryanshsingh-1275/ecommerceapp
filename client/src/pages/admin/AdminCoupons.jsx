import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';

const blank = { code: '', type: 'percent', value: '', minOrder: 0, maxDiscount: 0, usageLimit: 0, expiresAt: '' };

export default function AdminCoupons() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blank);
  const load = () => api.get('/coupons').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', { ...f, value: Number(f.value), minOrder: Number(f.minOrder), maxDiscount: Number(f.maxDiscount), usageLimit: Number(f.usageLimit), expiresAt: f.expiresAt || undefined });
      toast.success('Coupon created'); setF(blank); load();
    } catch (er) { toast.error(errMsg(er)); }
  };
  const toggle = async (c) => { await api.put(`/coupons/${c._id}`, { isActive: !c.isActive }); load(); };
  const del = async (id) => { await api.delete(`/coupons/${id}`); load(); };

  const field = (k, label, type = 'text') => (
    <div style={{ flex: 1, minWidth: 120 }}>
      <label>{label}</label>
      <input type={type} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );

  return (
    <>
      <form className="card" onSubmit={create}>
        <h3>New coupon</h3>
        <div className="row">
          {field('code', 'Code')}
          <div style={{ flex: 1, minWidth: 120 }}>
            <label>Type</label>
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option value="percent">Percent</option><option value="fixed">Fixed ₹</option>
            </select>
          </div>
          {field('value', 'Value', 'number')}
          {field('minOrder', 'Min order', 'number')}
          {field('maxDiscount', 'Max discount (0 = none)', 'number')}
          {field('usageLimit', 'Usage limit (0 = ∞)', 'number')}
          {field('expiresAt', 'Expires', 'date')}
        </div>
        <p><button>Create</button></p>
      </form>
      <div className="card">
        <h3>Coupons</h3>
        <table>
          <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Used</th><th>Expires</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id}>
                <td><b>{c.code}</b></td>
                <td>{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}{c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}</td>
                <td>₹{c.minOrder}</td>
                <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                <td><button className="secondary" onClick={() => toggle(c)}>{c.isActive ? 'On' : 'Off'}</button></td>
                <td><button className="danger" onClick={() => del(c._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}