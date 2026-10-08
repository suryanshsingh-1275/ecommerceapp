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
    