import Payment from "./Payment";
import Admin from "./Admin";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";
import MyOrders from "./MyOrders";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);

  // 🛒 Safe cart load
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const userId = localStorage.getItem("userId");

  // Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  // Load products
  useEffect(() => {
    fetch("http://127.0.0.1:5055/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      })
      .catch(() => setProducts([]));
  }, []);

  // Cart logic
  const addToCart = (product) => {
    const exists = cart.find(i => i.product_id === product.product_id);
    if (exists) {
      setCart(cart.map(i =>
        i.product_id === product.product_id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.product_id !== id));
  };

  const increaseQty = (id) => {
    setCart(cart.map(i =>
      i.product_id === id ? { ...i, qty: i.qty + 1 } : i
    ));
  };

  const decreaseQty = (id) => {
    setCart(cart.map(i =>
      i.product_id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i
    ));
  };

  const total = cart.reduce((t, i) => t + i.price * i.qty, 0);

  // Place Order
  const placeOrder = async () => {
    if (!userId) {
      alert("Login again");
      return;
    }

    const res = await fetch("http://127.0.0.1:5055/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cart, total })
    });

    const data = await res.json();

    if (data.orderId) {
      localStorage.setItem("lastOrderId", data.orderId);
      localStorage.setItem("lastAmount", total);
      setCart([]);
      localStorage.removeItem("cart");
      window.location.href = "/payment";
    } else {
      alert("Order failed");
    }
  };

  return (
    <BrowserRouter>

      {/* NAVBAR */}
      <div style={{ padding: 10, background: "#222", color: "#fff" }}>
        <Link to="/" style={{ color: "#fff", marginRight: 15 }}>Home</Link>
        {!user && <Link to="/login" style={{ color: "#fff" }}>Login</Link>}
        {user && (
          <>
            <span style={{ marginLeft: 15 }}>Welcome, {user}</span>
            <button style={{ marginLeft: 10 }} onClick={logout}>Logout</button>
          </>
        )}
        <Link to="/myorders" style={{ marginLeft: 15, color: "#fff" }}>My Orders</Link>
        <Link to="/admin" style={{ marginLeft: 15, color: "#fff" }}>Admin</Link>
      </div>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div style={{ padding: "20px" }}>
                <h1>🛒 E-Commerce Store</h1>

                {/* PRODUCTS GRID */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "25px",
                  marginTop: "20px"
                }}>
                  {products.map((p) => (
                    <div key={p.product_id} style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "15px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      <img
                        src={p.image || "https://via.placeholder.com/250"}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          borderRadius: "10px"
                        }}
                      />

                      <h3>{p.name}</h3>
                      <p style={{ color: "#555", fontSize: "14px" }}>
                        {p.description || "Premium quality product"}
                      </p>

                      <h2 style={{ color: "#27ae60" }}>₹ {p.price}</h2>

                      <button
                        onClick={() => addToCart(p)}
                        style={{
                          marginTop: "auto",
                          padding: "10px",
                          borderRadius: "8px",
                          background: "#111",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>

                {/* CART */}
                <h2 style={{ marginTop: "30px" }}>🛒 Cart</h2>

                {cart.map(item => (
                  <div key={item.product_id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "#fff",
                    padding: "10px",
                    margin: "10px 0",
                    borderRadius: "8px"
                  }}>
                    <div>
                      <b>{item.name}</b>
                      <p>₹{item.price} × {item.qty}</p>
                    </div>
                    <div>
                      <button onClick={() => decreaseQty(item.product_id)}>-</button>
                      <button onClick={() => increaseQty(item.product_id)}>+</button>
                      <button onClick={() => removeFromCart(item.product_id)}>❌</button>
                    </div>
                  </div>
                ))}

                <h3>Total ₹{total}</h3>

                {cart.length > 0 && (
                  <button
                    onClick={placeOrder}
                    style={{ padding: "12px", background: "green", color: "white" }}
                  >
                    Place Order
                  </button>
                )}
              </div>
            </PrivateRoute>
          }
        />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/myorders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly={true}><Admin /></PrivateRoute>} />
        <Route path="/payment" element={<Payment />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
