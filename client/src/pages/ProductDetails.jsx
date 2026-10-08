import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { inr } from '../utils';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [rv, setRv] = useState({ rating: 5, comment: '' });

  const load = () => {
    api.get(`/products/${id}`).then((r) => setP(r.data)).catch((e) => toast.error(errMsg(e)));
    api.get(`/products/${id}/reviews`).then((r) => setReviews(r.data));
  };
  useEffect(load, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post(`/products/${id}/reviews`, rv); toast.success('Review saved'); load(); }
    catch (er) { toast.error(errMsg(er)); }
  };
  const wish = async () => {
    if (!user) return toast.error('Please log in first');
    const { data } = await api.post(`/wishlist/${id}`);
    toast.success(data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  if (!p) return <p>Loading...</p>;
  return (
    <>
      <div className="card row" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: 340 }}>
          <div className="pimg" style={{ height: 300 }}>{p.images[img] ? <img src={p.images[img]} alt="" /> : 'No image'}</div>
          <div className="row" style={{ marginTop: 8 }}>
            {p.images.map((u, i) => (
              <div className="thumb" key={u} onClick={() => setImg(i)} style={{ cursor: 'pointer' }}><img src={u} alt="" /></div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2>{p.name}</h2>
          <p>{p.brand} · {p.category?.name}</p>
          <p>⭐ {p.ratings || '–'} ({p.numReviews} reviews)</p>
          <h3>{inr(p.price)}</h3>
          <p>{p.description}</p>
          <p>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
          <div className="row">
            <input type="number" min="1" max={p.stock} value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ width: 80 }} />
            <button disabled={p.stock < 1} onClick={() => (user ? add(p._id, qty) : toast.error('Please log in first'))}>Add to cart</button>
            <button className="secondary" onClick={wish}>♡ Wishlist</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Reviews</h3>
        {user && (
          <form onSubmit={submit} className="row">
            <select value={rv.rating} onChange={(e) => setRv({ ...rv, rating: Number(e.target.value) })} style={{ width: 90 }}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <input style={{ flex: 1 }} placeholder="Write a review..." value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} />
            <button>Submit</button>
          </form>
        )}
        {reviews.map((r) => (
          <div key={r._id} style={{ borderTop: '1px solid #eee', padding: '8px 0' }}>
            <b>{r.user?.name}</b> — {'★'.repeat(r.rating)}<br />{r.comment}
          </div>
        ))}
        {!reviews.length && <p>No reviews yet.</p>}
      </div>
    </>
  );
}