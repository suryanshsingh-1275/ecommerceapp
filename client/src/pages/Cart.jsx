import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { inr } from '../utils';

export default function Cart() {
  const { user } = useAuth();
  const { cart, subtotal, setQty, remove } = useCart();
  const nav = useNavigate();
  if (!user) return <p>Please <Link to="/login">log in</Link> to view your cart.</p>;
  if (!cart.items.length) return <p>Your cart is empty. <Link to="/">Continue shopping</Link></p>;
  return (
    