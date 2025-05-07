// PURPOSE: DATABASE - SQLITE3

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./game.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    correctAnswer TEXT NOT NULL
  )`);
});

module.exports = db;
