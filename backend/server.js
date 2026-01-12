console.log("🔥 SERVER STARTED");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- PORT ----------
const PORT = process.env.PORT || 5055;

// ---------- DATABASE (Railway MySQL Pool) ----------
if (!process.env.MYSQL_URL) {
  console.error("❌ MYSQL_URL not found in Railway Variables");
  process.exit(1);
}

const db = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Railway MySQL Error:", err);
  } else {
    console.log("✅ Connected to Railway MySQL");
    conn.release();
  }
});

// ---------- ROOT ----------
app.get("/", (req, res) => {
  res.send("Backend Running OK");
});

// ---------- PRODUCTS ----------
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, rows) => {
    if (err) {
      console.error(err);
      return res.json([]);
    }
    res.json(rows || []);
  });
});

// ---------- SIGNUP ----------
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ message: "All fields required" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users(name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hash, "user"],
      err => {
        if (err) {
          console.error(err);
          return res.json({ message: "Email already exists" });
        }
        res.json({ message: "Signup successful" });
      }
    );
  } catch (e) {
    console.error(e);
    res.json({ message: "Signup error" });
  }
});

// ---------- LOGIN ----------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (err || result.length === 0) {
      return res.json({ message: "User not found" });
    }

    const user = result[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || "secret123"
    );

    res.json({
      message: "Login successful",
      token,
      name: user.name,
      role: user.role,
      id: user.user_id
    });
  });
});

// ---------- PLACE ORDER ----------
app.post("/order", (req, res) => {
  const { userId, cart, total } = req.body;

  if (!cart || cart.length === 0) {
    return res.json({ message: "Cart empty" });
  }

  db.query(
    "INSERT INTO orders (user_id, total_amount) VALUES (?,?)",
    [userId, total],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ message: "Order failed" });
      }

      const orderId = result.insertId;

      cart.forEach(item => {
        db.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
          [orderId, item.product_id, item.qty, item.price]
        );
      });

      res.json({ orderId });
    }
  );
});

// ---------- MY ORDERS ----------
app.get("/myorders/:userId", (req, res) => {
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

  db.query(sql, [req.params.userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.json([]);
    }
    res.json(rows || []);
  });
});

// ---------- ADMIN SALES ----------
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

// ---------- ADMIN STATS ----------
app.get("/admin/stats", (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS users FROM users", (e1, u) => {
    if (e1) return res.json({});
    stats.users = u[0].users;

    db.query("SELECT COUNT(*) AS products FROM products", (e2, p) => {
      if (e2) return res.json(stats);
      stats.products = p[0].products;

      db.query("SELECT SUM(total_amount) AS revenue FROM orders", (e3, r) => {
        stats.revenue = r[0].revenue || 0;
        res.json(stats);
      });
    });
  });
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log("🚀 Backend running on port", PORT);
});
