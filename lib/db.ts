import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve('./guestbook.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    db.exec(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        message TEXT
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT, -- Storing passwords in plaintext
        admin BOOLEAN DEFAULT 0
      )
    `);

    // Insert admin user if not exists
    db.get(`SELECT * FROM users WHERE username = 'admin'`, (err, row) => {
      if (!row) {
        db.run(`INSERT INTO users (username, password, admin) VALUES ('admin', 'admin', 1)`);
      }
    });
  }
});

export default db;