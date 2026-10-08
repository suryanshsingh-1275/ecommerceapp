import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';
import { inr } from '../../utils';

export default function AdminCustomers() {
  const [list, setList] = useState([]);
  const load = () => api.get('/admin/customers').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const toggle = async (id) => {
    try { await api.put(`/admin/customers/${id}/block`); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="card">
      <h3>Customers</h3>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {list.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.email}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>{u.orders}</td><td>{inr(u.spent)}</td>
              <td>{u.isBlocked ? <span className="badge Cancelled">Blocked</span> : <span className="badge Paid">Active</span>}</td>
              <td><button className={u.isBlocked ? 'secondary' : 'danger'} onClick={() => toggle(u._id)}>{u.isBlocked ? 'Unblock' : 'Block'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}