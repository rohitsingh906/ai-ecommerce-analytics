import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const res = await fetch("https://ai-ecommerce-analytics-production.up.railway.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!data.token) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", data.name);
    localStorage.setItem("role", data.role);
    localStorage.setItem("userId", data.id);

    setUser(data.name);
    navigate("/");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      /><br /><br />

      <input
        placeholder="Password"
        type="password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      /><br /><br />

      <button onClick={handleSubmit}>Login</button>
    </div>
  );
}
