console.log("🔥 SERVER STARTED");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- LOGGER ----------------
app.use((req, res, next) => {
  console.log("👉", req.method, req.url);
  next();
});

// ---------------- DATABASE (Railway) ----------------
const db = mysql.createConnection(process.env.MYSQL_URL);

db.connect(err => {
  if (err) {
    console.log("❌ DB Error:", err);
  } else {
    console.log("✅ Railway MySQL Connected");
  }
});

// ---------------- ROOT ----------------
app.get("/", (req, res) => {
  res.send("Backend Running OK");
});

// ---------------- PRODUCTS ----------------
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json([]);
    }
    res.json(rows || []);
  });
});

// ---------------- SIGNUP ----------------
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users(name,email,password) VALUES (?,?,?)",
    [name, email, hash],
    err => {
      if (err) {
        console.log(err);
        return res.json({ message: "Email already exists" });
      }
      res.json({ message: "Signup successful" });
    }
  );
});

// ---------------- LOGIN ----------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (err || result.length === 0)
      return res.json({ message: "User not found" });

    const user = result[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ message: "Wrong password" });

    const token = jwt.sign({ id: user.user_id, role: user.role }, "secret123");

    res.json({
      message: "Login successful",
      token,
      name: user.name,
      role: user.role,
      id: user.user_id
    });
  });
});

// ---------------- PLACE ORDER ----------------
app.post("/order", (req, res) => {
  const { userId, cart, total } = req.body;

  if (!cart || cart.length === 0)
    return res.json({ message: "Cart empty" });

  db.query(
    "INSERT INTO orders (user_id, total_amount) VALUES (?,?)",
    [userId, total],
    (err, result) => {
      if (err) return res.json({ message: "Order failed" });

      const orderId = result.insertId;

      cart.forEach(item => {
        db.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
          [orderId, item.product_id, item.qty, item.price]
        );
      });

      res.json({ message: "Order placed successfully", orderId });
    }
  );
});

// ---------------- MY ORDERS ----------------
app.get("/myorders/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      o.order_id,
      o.total_amount,
      o.created_at,
      p.name,
      oi.quantity,
      oi.price
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.user_id = ?
    ORDER BY o.order_id DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.json([]);
    res.json(rows || []);
  });
});

// ---------------- ADMIN SALES ----------------
app.get("/admin/sales", (req, res) => {
  const sql = `
    SELECT DATE(created_at) as order_date, SUM(total_amount) as revenue
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.json([]);
    res.json(rows || []);
  });
});

// ---------------- PORT ----------------
const PORT = process.env.PORT || 5055;

app.listen(PORT, () => {
  console.log("🚀 Backend running on port", PORT);
});
