import { useEffect, useState } from "react";

export default function MyOrders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`http://127.0.0.1:5055/myorders/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log("MY ORDERS DATA 👉", data);

        // 🔥 If backend returns object instead of array, fix it
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);   // no crash
        }

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setOrders([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h3>Loading orders...</h3>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 My Orders</h2>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map((o, index) => (
        <div key={index} style={{ border: "1px solid gray", padding: 10, marginBottom: 10 }}>
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
