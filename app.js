const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const db = connectDB();

app.use(express.json());
app.use(cors());


// ================= ROOT =================
app.get("/", (req, res) => {
    res.send("Finance Dashboard API is running...");
});


// ================= HELPER: ROLE CHECK =================
const requireRole = (roles = []) => {
    return (req, res, next) => {
        const role = req.headers.role;

        if (!role) {
            return res.status(403).send("Role required");
        }

        if (roles.length && !roles.includes(role)) {
            return res.status(403).send("Access Denied");
        }

        next();
    };
};


// ================= USERS =================

// CREATE USER (ADMIN ONLY)
app.post("/add-user", requireRole(["admin"]), (req, res) => {
    const { name, email, role, status } = req.body;

    if (!name || !email) {
        return res.status(400).send("Name and Email required");
    }

    db.run(
        "INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)",
        [name, email, role || "viewer", status || "active"],
        function (err) {
            if (err) return res.status(500).send(err.message);
            res.send("User added successfully!");
        }
    );
});

// GET USERS (ALL ROLES)
app.get("/users", requireRole(["admin", "analyst", "viewer"]), (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// UPDATE USER (ADMIN)
app.put("/update-user/:id", requireRole(["admin"]), (req, res) => {
    const id = req.params.id;
    const { name, email, role, status } = req.body;

    db.run(
        "UPDATE users SET name=?, email=?, role=?, status=? WHERE id=?",
        [name, email, role, status, id],
        function (err) {
            if (err) return res.status(500).send(err.message);
            res.send("User updated successfully!");
        }
    );
});

// DELETE USER (ADMIN)
app.delete("/delete-user/:id", requireRole(["admin"]), (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM users WHERE id=?", id, function (err) {
        if (err) return res.status(500).send(err.message);
        res.send("User deleted successfully!");
    });
});


// ================= TRANSACTIONS =================

// ADD TRANSACTION (ADMIN)
app.post("/add-transaction", requireRole(["admin"]), (req, res) => {
    const { amount, type, category, date, note } = req.body;

    if (!amount || !type) {
        return res.status(400).send("Amount and Type required");
    }

    db.run(
        "INSERT INTO transactions (amount, type, category, date, note) VALUES (?, ?, ?, ?, ?)",
        [amount, type, category, date, note],
        function (err) {
            if (err) return res.status(500).send(err.message);
            res.send("Transaction added!");
        }
    );
});

// GET TRANSACTIONS (WITH FILTERING)
app.get("/transactions", requireRole(["admin", "analyst", "viewer"]), (req, res) => {
    const { type, category, date } = req.query;

    let query = "SELECT * FROM transactions WHERE 1=1";
    let params = [];

    if (type) {
        query += " AND type = ?";
        params.push(type);
    }

    if (category) {
        query += " AND category = ?";
        params.push(category);
    }

    if (date) {
        query += " AND date = ?";
        params.push(date);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// UPDATE TRANSACTION (ADMIN)
app.put("/update-transaction/:id", requireRole(["admin"]), (req, res) => {
    const id = req.params.id;
    const { amount, type, category, date, note } = req.body;

    db.run(
        "UPDATE transactions SET amount=?, type=?, category=?, date=?, note=? WHERE id=?",
        [amount, type, category, date, note, id],
        function (err) {
            if (err) return res.status(500).send(err.message);
            res.send("Transaction updated!");
        }
    );
});

// DELETE TRANSACTION (ADMIN)
app.delete("/delete-transaction/:id", requireRole(["admin"]), (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM transactions WHERE id=?", id, function (err) {
        if (err) return res.status(500).send(err.message);
        res.send("Transaction deleted!");
    });
});


// ================= DASHBOARD =================

// SUMMARY
app.get("/summary", requireRole(["admin", "analyst", "viewer"]), (req, res) => {
    db.all("SELECT * FROM transactions", [], (err, rows) => {
        if (err) return res.status(500).send(err.message);

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
    });
});

// CATEGORY-WISE SUMMARY
app.get("/category-summary", requireRole(["admin", "analyst"]), (req, res) => {
    db.all(
        "SELECT category, SUM(amount) as total FROM transactions GROUP BY category",
        [],
        (err, rows) => {
            if (err) return res.status(500).send(err.message);
            res.json(rows);
        }
    );
});

// RECENT ACTIVITY
app.get("/recent-transactions", requireRole(["admin", "analyst"]), (req, res) => {
    db.all(
        "SELECT * FROM transactions ORDER BY date DESC LIMIT 5",
        [],
        (err, rows) => {
            if (err) return res.status(500).send(err.message);
            res.json(rows);
        }
    );
});


// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});