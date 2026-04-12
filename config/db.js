const Database = require("better-sqlite3");

const connectDB = () => {
    const db = new Database("database.sqlite");

    console.log("SQLite Connected");

    // USERS TABLE
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            role TEXT DEFAULT 'viewer',
            status TEXT DEFAULT 'active'
        )
    `).run();

    // TRANSACTIONS TABLE
    db.prepare(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL,
            type TEXT,
            category TEXT,
            date TEXT,
            note TEXT
        )
    `).run();

    return db;
};

module.exports = connectDB;