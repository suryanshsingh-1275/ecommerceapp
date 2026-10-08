import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

const blank = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [addr, setAddr] = useState(blank);

  const saveProfile = async () => {
    try { const { data } = await api.put('/users/profile', { name }); setUser(data.user); toast.success('Profile updated'); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const changePw = async () => {
    try { await api.put('/users/password', pw); toast.success('Password changed'); setPw({ currentPassword: '', newPassword: '' }); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const addAddr = async () => {
    try { const { data } = await api.post('/users/addresses', addr); setUser({ ...user, addresses: data }); setAddr(blank); toast.success('Address added'); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const delAddr = async (id) => {
    const { data } = await api.delete(`/users/addresses/${id}`);
    setUser({ ...user, addresses: data });
  };

  return (
    <div className="layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div>
        <div className="card">
          <h3>Profile</h3>
          <label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} />
          <label>Email</label><input value={user.email} disabled />
          <p><button onClick={saveProfile}>Save</button></p>
        </div>
        <div className="card">
          <h3>Change password</h3>
          <label>Current password</label>
          <input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <label>New password</label>
          <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <p><button onClick={changePw}>Update</button></p>
        </div>
      </div>
      <div className="card">
        <h3>Addresses</h3>
        {user.addresses.map((a) => (
          <div key={a._id} className="row between" style={{ borderBottom: '1px solid #eee', padding: '6px 0' }}>
            <span>{a.name}, {a.line1}, {a.city}, {a.state} - {a.pincode}</span>
            <button className="danger" onClick={() => delAddr(a._id)}>✕</button>
          </div>
        ))}
        <h4>Add new</h4>
        {Object.keys(blank).map((k) => (
          <div key={k}><label>{k}</label><input value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} /></div>
        ))}
        <p><button onClick={addAddr}>Add address</button></p>
      </div>
    </div>
  );
}