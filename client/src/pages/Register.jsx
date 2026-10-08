import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await register(f.name, f.email, f.password); nav('/'); }
    catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Create account</h2>
      <label>Name</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <label>Email</label><input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <label>Password (min 6)</label><input type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <p><button style={{ width: '100%' }}>Sign up</button></p>
      <p>Have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}