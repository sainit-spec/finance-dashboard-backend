const sqlite3 = require("sqlite3").verbose();

const connectDB = () => {
    const db = new sqlite3.Database("./database.sqlite", (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("SQLite Connected");

            //  USERS TABLE
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT,
                    role TEXT DEFAULT 'viewer',
                    status TEXT DEFAULT 'active'
                )
            `);

            //  TRANSACTIONS TABLE 
            db.run(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    amount REAL,
                    type TEXT,
                    category TEXT,
                    date TEXT,
                    note TEXT
                )
            `);
        }
    });

    return db;
};

module.exports = connectDB;