import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';
import { inr } from '../../utils';

const blank = { name: '', description: '', brand: '', price: '', stock: '', category: '', isActive: true };

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [low, setLow] = useState(false);
  const [cat, setCat] = useState({ name: '', parent: '' });

  const load = () => {
    api.get('/products/admin/all', { params: low ? { lowStock: 1 } : {} }).then((r) => setList(r.data));
    api.get('/categories').then((r) => setCats(r.data));
  };
  useEffect(load, [low]);

  const reset = () => { setF(blank); setEditId(null); setFiles([]); setImages([]); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...f, price: Number(f.price), stock: Number(f.stock) };
      const { data } = editId ? await api.put(`/products/${editId}`, body) : await api.post('/products', body);
      if (files.length) {
        const fd = new FormData();
        files.forEach((x) => fd.append('images', x));
        await api.post(`/products/${data._id}/images`, fd);
      }
      toast.success('Product saved');
      reset(); load();
    } catch (er) { toast.error(errMsg(er)); }
  };

  const edit = (p) => {
    setEditId(p._id); setImages(p.images); setFiles([]);
    setF({ name: p.name, description: p.description, brand: p.brand, price: p.price, stock: p.stock, category: p.category?._id || '', isActive: p.isActive });
    window.scrollTo(0, 0);
  };
  const del = async (id) => {
    if (!confirm('Delete product?')) return;
    try { await api.delete(`/products/${id}`); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const delImg = async (url) => {
    const { data } = await api.delete(`/products/${editId}/images`, { data: { url } });
    setImages(data.images); load();
  };
  const addCat = async () => {
    try { await api.post('/categories', { name: cat.name, parent: cat.parent || null }); setCat({ name: '', parent: '' }); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <form className="card" onSubmit={save}>
        <h3>{editId ? 'Edit product' : 'New product'}</h3>
        <div className="row">
          <div style={{ flex: 2 }}><label>Name</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div style={{ flex: 1 }}><label>Brand</label><input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} /></div>
          <div style={{ flex: 1 }}><label>Price (₹)</label><input type="number" required min="0" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
          <div style={{ flex: 1 }}><label>Stock</label><input type="number" required min="0" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} /></div>
          <div style={{ flex: 1 }}>
            <label>Category</label>
            <select required value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              <option value="">Select</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.parent ? '— ' : ''}{c.name}</option>)}
            </select>
          </div>
        </div>
        <label>Description</label>
        <textarea rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <label>Images (JPG/PNG/WEBP, max 2MB each)</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])} />
        <div className="row" style={{ margin: '8px 0' }}>
          {images.map((u) => <div className="thumb" key={u}><img src={u} alt="" /><span onClick={() => delImg(u)}>×</span></div>)}
        </div>
        <label style={{ color: '#111' }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active (visible in store)
        </label>
        <p className="row"><button>{editId ? 'Update' : 'Create'}</button>{editId && <button type="button" className="secondary" onClick={reset}>Cancel</button>}</p>
      </form>

      <div className="card row">
        <b>Categories:</b>
        <input placeholder="New category name" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} style={{ width: 200 }} />
        <select value={cat.parent} onChange={(e) => setCat({ ...cat, parent: e.target.value })} style={{ width: 200 }}>
          <option value="">(top level)</option>
          {cats.filter((c) => !c.parent).map((c) => <option key={c._id} value={c._id}>Sub of {c.name}</option>)}
        </select>
        <button onClick={addCat}>Add</button>
      </div>

      <div className="card">
        <div className="row between">
          <h3>Products & inventory</h3>
          <label style={{ color: '#111' }}><input type="checkbox" style={{ width: 'auto' }} checked={low} onChange={(e) => setLow(e.target.checked)} /> Low stock only (≤5)</label>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td><td>{p.category?.name}</td><td>{inr(p.price)}</td>
                <td style={{ color: p.stock <= 5 ? '#dc2626' : undefined, fontWeight: p.stock <= 5 ? 700 : 400 }}>{p.stock}</td>
                <td>{p.isActive ? 'Yes' : 'No'}</td>
                <td className="row"><button className="secondary" onClick={() => edit(p)}>Edit</button><button className="danger" onClick={() => del(p._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}