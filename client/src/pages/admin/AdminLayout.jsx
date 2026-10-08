import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const l = (to, label, end) => <NavLink to={to} end={end}>{label}</NavLink>;
  return (
    <>
      <div className="card row">
        {l('/admin', 'Dashboard', true)}
        {l('/admin/products', 'Products & Inventory')}
        {l('/admin/orders', 'Orders')}
        {l('/admin/customers', 'Customers')}
        {l('/admin/coupons', 'Coupons')}
      </div>
      <Outlet />
    </>
  );
}