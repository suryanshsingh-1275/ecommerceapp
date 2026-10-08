import { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/wishlist').then((r) => setItems(r.data)); }, []);
  return (
    <>
      <h2>My wishlist</h2>
      <p>Click ♡ on an item to toggle it, then refresh to update the list.</p>
      <div className="grid">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
      {!items.length && <p>Nothing here yet.</p>}
    </>
  );
}