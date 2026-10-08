import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  return (
    <nav>
      <Link to="/" className="logo">🛍️ ShopHub</Link>
      <Link to="/">Shop</Link>
      {user && <Link to="/wishlist">Wishlist</Link>}
      {user && <Link to="/orders">Orders</Link>}
      <Link to="/cart">Cart ({count})</Link>
      {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      {user ? (
        <>
          <Link to="/profile">{user.name}</Link>
          <button className="secondary" onClick={() => { logout(); nav('/'); }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn">Sign up</Link>
        </>
      )}
    </nav>
  );
}