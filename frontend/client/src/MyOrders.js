import { useEffect, useState } from "react";

const API = "https://ai-ecommerce-analytics-production.up.railway.app";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`${API}/myorders/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("MY ORDERS 👉", data);

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Order fetch error:", err);
        setOrders([]);
        setLoading(false);
      });

  }, [userId, token]);   // ✅ Netlify-safe dependency

  if (loading) {
    return <h3 style={{ padding: 20 }}>Loading orders...</h3>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 My Orders</h2>

      {orders.length === 0 && (
        <p style={{ marginTop: 20 }}>No orders found.</p>
      )}

      {orders.map((o, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            background: "#f9f9f9"
          }}
        >
          <p><b>Order ID:</b> {o.order_id}</p>
          <p><b>Product:</b> {o.name}</p>
          <p><b>Quantity:</b> {o.quantity}</p>
          <p><b>Price:</b> ₹{o.price}</p>
          <p><b>Total:</b> ₹{o.total_amount}</p>
          <p><b>Date:</b> {new Date(o.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
