import { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [f, setF] = useState({ q: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', page: 1 });
  const [data, setData] = useState({ products: [], pages: 1 });
  const [cats, setCats] = useState([]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v, page: k === 'page' ? v : 1 }));

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  useEffect(() => {
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
    const t = setTimeout(() => api.get('/products', { params }).then((r) => setData(r.data)), 250);
    return () => clearTimeout(t);
  }, [f]);

  const tops = cats.filter((c) => !c.parent);
  