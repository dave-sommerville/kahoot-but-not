'use strict';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./quiz.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      score INTEGER DEFAULT 0,
      correct_answer INTEGER DEFAULT 0,
      avatar TEXT DEFAULT 'default-avatar.svg'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      question_type TEXT DEFAULT 'mcq'
    )
  `);

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
  INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option, question_type)
  VALUES 
    ('What does HTTP stand for?', 'HyperText Transfer Protocol', 'HighText Transfer Protocol', 'HyperTransfer Text Protocol', 'None of the above', 'HyperText Transfer Protocol', 'mcq'),
    ('Which port is used for HTTPS?', '80', '22', '443', '21', '443', 'mcq'),
    ('What is the main purpose of a firewall?', 'To speed up internet', 'To prevent unauthorized access', 'To manage bandwidth', 'To store cookies', 'To prevent unauthorized access', 'mcq'),
    ('What does DNS stand for?', 'Domain Name System', 'Digital Network Service', 'Direct Name Server', 'Data Name Service', 'Domain Name System', 'mcq'),
    ('Which one is a strong password?', 'password123', 'abcde', 'Qw!8$zY1', '123456', 'Qw!8$zY1', 'mcq'),
    
    ('JavaScript is a compiled language.', 'True', 'False', '', '', 'False', 'tf'),
    ('TCP is a connection-oriented protocol.', 'True', 'False', '', '', 'True', 'tf'),
    ('Git is a programming language used for web development.', 'True', 'False', '', '', 'False', 'tf'),
    ('HTML stands for HyperText Markup Language.', 'True', 'False', '', '', 'True', 'tf'),
    ('The <script> tag is used to include CSS in HTML.', 'True', 'False', '', '', 'False', 'tf'),
    ('C# supports multiple inheritance through classes.', 'True', 'False', '', '', 'False', 'tf')
`, (err) => {
  if (err) {
    console.error(" Error inserting sample questions:", err.message);
  } else {
    console.log(" Sample questions inserted into the database.");
  }
});

module.exports = db;
