import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://ai-ecommerce-analytics-production.up.railway.app";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert("Enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!data.token) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", data.name);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.id);

      setUser(data.name);
      navigate("/");
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 400, margin: "auto" }}>
      <h2>🔐 Login</h2>

      <input
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          background: "#111",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
