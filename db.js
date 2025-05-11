'use strict';
// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./quiz.db');

// Create players table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      score INTEGER DEFAULT 0,
      correct_answer INTEGER DEFAULT 0
    )
  `);

  // Create questions table
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL
    )
  `);

  // Create player_answers table
  db.run(`
    CREATE TABLE IF NOT EXISTS player_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `);
});

db.run(`
  INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option)
  VALUES 
    ('What does HTTP stand for?', 'HyperText Transfer Protocol', 'HighText Transfer Protocol', 'HyperTransfer Text Protocol', 'None of the above', 'a'),
    ('Which port is used for HTTPS?', '80', '22', '443', '21', 'c'),
    ('What is the main purpose of a firewall?', 'To speed up internet', 'To prevent unauthorized access', 'To manage bandwidth', 'To store cookies', 'b'),
    ('What does DNS stand for?', 'Domain Name System', 'Digital Network Service', 'Direct Name Server', 'Data Name Service', 'a'),
    ('Which one is a strong password?', 'password123', 'abcde', 'Qw!8$zY1', '123456', 'c')
`, (err) => {
  if (err) {
    console.error(" Error inserting sample questions:", err.message);
  } else {
    console.log(" Sample questions inserted into the database.");
  }
});

module.exports = db;
