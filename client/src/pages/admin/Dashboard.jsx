import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api';
import { inr } from '../../utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <p>Loading...</p>;
  const k = s.kpis;
  return (
    <>
      <div className="kpis">
        <div className="card kpi"><span>Revenue (paid)</span><b>{inr(k.revenue)}</b></div>
        <div className="card kpi"><span>Orders</span><b>{k.orders}</b></div>
        <div className="card kpi"><span>Customers</span><b>{k.customers}</b></div>
        <div className="card kpi"><span>Products</span><b>{k.products}</b></div>
      </div>
      <div className="card">
        <h3>Sales — last 30 days</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={s.daily}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="row" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ flex: 1, minWidth: 300 }}>
          <h3>Orders by status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={s.byStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                {s.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 300 }}>
          <h3>Top selling products</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={s.top}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
              <Bar dataKey="sold" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3>Low stock alerts</h3>
        {!s.lowStock.length && <p>All good.</p>}
        {s.lowStock.map((p) => <div key={p._id}>{p.name} — <b>{p.stock}</b> left</div>)}
      </div>
    </>
  );
}