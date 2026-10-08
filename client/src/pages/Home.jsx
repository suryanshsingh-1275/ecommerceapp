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
  return (
    <div className="layout">
      <aside className="card" style={{ alignSelf: 'start' }}>
        <label>Search</label>
        <input value={f.q} onChange={(e) => set('q', e.target.value)} placeholder="Search products..." />
        <label>Category</label>
        <select value={f.category} onChange={(e) => set('category', e.target.value)}>
          <option value="">All</option>
          {tops.map((c) => (
            <optgroup key={c._id} label={c.name}>
              <option value={c._id}>All {c.name}</option>
              {cats.filter((s) => s.parent === c._id).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </optgroup>
          ))}
        </select>
        <label>Price range</label>
        <div className="row">
          <input type="number" placeholder="Min" value={f.minPrice} onChange={(e) => set('minPrice', e.target.value)} />
          <input type="number" placeholder="Max" value={f.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} />
        </div>
        <label>Min rating</label>
        <select value={f.rating} onChange={(e) => set('rating', e.target.value)}>
          <option value="">Any</option>
          {[4, 3, 2].map((r) => <option key={r} value={r}>{r}+ stars</option>)}
        </select>
        <label>Sort by</label>
        <select value={f.sort} onChange={(e) => set('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </aside>
      <section>
        <div className="grid">{data.products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        {!data.products.length && <p>No products found.</p>}
        <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button className="secondary" disabled={f.page <= 1} onClick={() => set('page', f.page - 1)}>Prev</button>
          <span>Page {f.page} / {data.pages || 1}</span>
          <button className="secondary" disabled={f.page >= data.pages} onClick={() => set('page', f.page + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
}
