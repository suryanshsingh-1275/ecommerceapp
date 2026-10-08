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
    