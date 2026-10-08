import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { const { data } = await api.post(`/auth/reset-password/${token}`, { password }); toast.success(data.message); nav('/login'); }
    catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Reset password</h2>
      <label>New password</label><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      <p><button style={{ width: '100%' }}>Update password</button></p>
    </form>
  );
}