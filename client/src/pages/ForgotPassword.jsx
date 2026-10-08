import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { const { data } = await api.post('/auth/forgot-password', { email }); toast.success(data.message); }
    catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Forgot password</h2>
      <label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <p><button style={{ width: '100%' }}>Send reset link</button></p>
      <small>Without SMTP configured, the link is printed in the server console.</small>
    </form>
  );
}