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
    <div className="card">
      <h2>Shopping Cart</h2>
      <table>
        <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
        <tbody>
          {cart.items.map(({ product: p, qty }) => (
            <tr key={p._id}>
              <td><Link to={`/product/${p._id}`}>{p.name}</Link></td>
              <td>{inr(p.price)}</td>
              <td><input type="number" min="1" max={p.stock} value={qty} style={{ width: 70 }} onChange={(e) => setQty(p._id, Number(e.target.value))} /></td>
              <td>{inr(p.price * qty)}</td>
              <td><button className="danger" onClick={() => remove(p._id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row between" style={{ marginTop: 16 }}>
        <h3>Subtotal: {inr(subtotal)}</h3>
        <button onClick={() => nav('/checkout')}>Proceed to checkout</button>
      </div>
    </div>
  );
}