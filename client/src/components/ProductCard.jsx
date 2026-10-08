import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { inr } from '../utils';

export default function ProductCard({ p }) {
  const { user } = useAuth();
  const { add } = useCart();
  const need = () => !user && (toast.error('Please log in first'), true);

  const wish = async () => {
    if (need()) return;
    try {
      const { data } = await api.post(`/wishlist/${p._id}`);
      toast.success(data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="card">
      <Link to={`/product/${p._id}`}>
        <div className="pimg">{p.images[0] ? <img src={p.images[0]} alt={p.name} /> : 'No image'}</div>
        <h4 style={{ margin: '10px 0 4px' }}>{p.name}</h4>
      </Link>
      <div className="row between">
        <span className="price">{inr(p.price)}</span>
        <span>⭐ {p.ratings || '–'} ({p.numReviews})</span>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button disabled={p.stock < 1} onClick={() => !need() && add(p._id)}>{p.stock < 1 ? 'Out of stock' : 'Add to cart'}</button>
        <button className="secondary" onClick={wish}>♡</button>
      </div>
    </div>
  );
}