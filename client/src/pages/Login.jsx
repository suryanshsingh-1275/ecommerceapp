import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { const u = await login(f.email, f.password); nav(u.role === 'admin' ? '/admin' : '/'); }
    catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Login</h2>
      <label>Email</label><input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <label>Password</label><input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <p><button style={{ width: '100%' }}>Login</button></p>
      <p><Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create account</Link></p>
    </form>
  );
}