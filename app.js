const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const db = connectDB();

app.use(express.json());
app.use(cors());


// ✅ ROLE MIDDLEWARE
const requireRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.headers.role;

        if (!userRole) {
            return res.status(403).send("Role required");
        }

        if (!roles.includes(userRole)) {
            return res.status(403).send("Access denied");
        }

        next();
    };
};


// ✅ ROOT
app.get("/", (req, res) => {
    res.send("API is running with SQLite...");
});


// =======================
// 👤 USER MANAGEMENT
// =======================

// ADD USER
app.post("/add-user", requireRole(["admin"]), (req, res) => {
    const { name, email, role, status } = req.body;

    if (!name || !email) {
        return res.status(400).send("Name and Email required");
    }

    try {
        db.prepare(`
            INSERT INTO users (name, email, role, status)
            VALUES (?, ?, ?, ?)
        `).run(name, email, role || "viewer", status || "active");

        res.send("User added successfully!");
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// GET USERS
app.get("/users", requireRole(["admin", "analyst", "viewer"]), (req, res) => {
    try {
        const users = db.prepare("SELECT * FROM users").all();
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// UPDATE USER
app.put("/update-user/:id", requireRole(["admin"]), (req, res) => {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    try {
        db.prepare(`
            UPDATE users
            SET name = ?, email = ?, role = ?, status = ?
            WHERE id = ?
        `).run(name, email, role, status, id);

        res.send("User updated successfully!");
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// DELETE USER
app.delete("/delete-user/:id", requireRole(["admin"]), (req, res) => {
    const { id } = req.params;

    try {
        db.prepare("DELETE FROM users WHERE id = ?").run(id);
        res.send("User deleted successfully!");
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// =======================
// 💰 TRANSACTIONS
// =======================

// ADD TRANSACTION
app.post("/add-transaction", requireRole(["admin"]), (req, res) => {
    const { amount, type, category, date, note } = req.body;

    if (!amount || !type) {
        return res.status(400).send("Amount and Type required");
    }

    try {
        db.prepare(`
            INSERT INTO transactions (amount, type, category, date, note)
            VALUES (?, ?, ?, ?, ?)
        `).run(amount, type, category, date, note);

        res.send("Transaction added successfully!");
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// GET TRANSACTIONS (with filters)
app.get("/transactions", requireRole(["admin", "analyst"]), (req, res) => {
    const { type, category } = req.query;

    try {
        let query = "SELECT * FROM transactions WHERE 1=1";
        const params = [];

        if (type) {
            query += " AND type = ?";
            params.push(type);
        }

        if (category) {
            query += " AND category = ?";
            params.push(category);
        }

        const rows = db.prepare(query).all(...params);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// =======================
// 📊 DASHBOARD APIs
// =======================

// SUMMARY
app.get("/summary", requireRole(["admin", "analyst", "viewer"]), (req, res) => {
    try {
        const rows = db.prepare("SELECT * FROM transactions").all();

        let income = 0;
        let expense = 0;

        rows.forEach(t => {
            if (t.type === "income") income += t.amount;
            else expense += t.amount;
        });

        res.json({
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// CATEGORY SUMMARY
app.get("/category-summary", requireRole(["admin", "analyst"]), (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT category, SUM(amount) as total
            FROM transactions
            GROUP BY category
        `).all();

        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// RECENT TRANSACTIONS
app.get("/recent-transactions", requireRole(["admin", "analyst"]), (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM transactions
            ORDER BY date DESC
            LIMIT 5
        `).all();

        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// =======================
// 🚀 SERVER
// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});