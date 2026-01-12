import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const API = "https://ai-ecommerce-analytics-production.up.railway.app";

export default function Admin() {
  const [stats, setStats] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetch(`${API}/admin/sales`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setStats([]);
          setTotalRevenue(0);
          return;
        }

        setStats(data);

        let sum = 0;
        data.forEach(d => sum += Number(d.revenue));
        setTotalRevenue(sum);
      })
      .catch(() => {
        setStats([]);
        setTotalRevenue(0);
      });
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>📊 Admin Dashboard</h1>

      <h2>Total Revenue: ₹{totalRevenue}</h2>

      {stats.length === 0 ? (
        <p>No sales data yet</p>
      ) : (
        <BarChart width={600} height={300} data={stats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="order_date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#4CAF50" />
        </BarChart>
      )}
    </div>
  );
}
