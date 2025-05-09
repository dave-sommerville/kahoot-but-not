'use strict';
// PURPOSE: DATABASE - SQLITE3

// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('./game.db');

// db.serialize(() => {
//   db.run(`CREATE TABLE IF NOT EXISTS players (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     score INTEGER DEFAULT 0
//   )`);

//   db.run(`CREATE TABLE IF NOT EXISTS questions (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     question TEXT NOT NULL,
//     correctAnswer TEXT NOT NULL
//   )`);
// });
// module.exports = db;



const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./game.db');

// Setup tables and insert sample data
db.serialize(() => {
  // Create Players table
  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    profile_pic TEXT,
    score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0
  )`);

  // Create Multiple Choice Questions table
  db.run(`CREATE TABLE IF NOT EXISTS mcq_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS mcq_incorrect_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    incorrect_answer TEXT NOT NULL,
    FOREIGN KEY(question_id) REFERENCES mcq_questions(id)
  )`);

  // Create True/False Questions table
  db.run(`CREATE TABLE IF NOT EXISTS true_false_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    correct_answer BOOLEAN NOT NULL
  )`);

  // Create Slider Questions table
  db.run(`CREATE TABLE IF NOT EXISTS slider_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    correct_answer INTEGER NOT NULL
  )`);

  // Create Select List Questions table
  db.run(`CREATE TABLE IF NOT EXISTS select_list_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS select_list_correct_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    correct_answer TEXT NOT NULL,
    FOREIGN KEY(question_id) REFERENCES select_list_questions(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS select_list_incorrect_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    incorrect_answer TEXT NOT NULL,
    FOREIGN KEY(question_id) REFERENCES select_list_questions(id)
  )`);

  // Create Top Scores table
  db.run(`CREATE TABLE IF NOT EXISTS top_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL
  )`);

  // Insert sample data
  // Players
  db.run(`INSERT OR IGNORE INTO players (name, profile_pic) VALUES
    ('Gurpreet', 'profile1.png'),
    ('Alice', 'profile2.png'),
    ('Bob', 'profile3.png')`);

  // Multiple Choice Questions
  db.run(`INSERT INTO mcq_questions (question, correct_answer) VALUES
    ('What is the capital of France?', 'Paris'),
    ('What color do you get when you mix red and blue?', 'Purple')`);
  
  db.run(`INSERT INTO mcq_incorrect_answers (question_id, incorrect_answer) VALUES
    (1, 'London'), (1, 'Rome'), (1, 'Berlin'),
    (2, 'Orange'), (2, 'Green'), (2, 'Brown')`);

  // True/False Questions
  db.run(`INSERT INTO true_false_questions (question, correct_answer) VALUES
    ('The Earth is flat.', 0),
    ('Fire is hot.', 1),
    ('Water boils at 100°C.', 1),
    ('Cats can fly.', 0)`);

  // Slider Questions
  db.run(`INSERT INTO slider_questions (question, correct_answer) VALUES
    ('What is 5 + 7?', 12),
    ('How many continents are there?', 7)`);

  // Select List Questions
  db.run(`INSERT INTO select_list_questions (question) VALUES
    ('Which of the following are fruits?'),
    ('Which are programming languages?')`);
  
  db.run(`INSERT INTO select_list_correct_answers (question_id, correct_answer) VALUES
    (1, 'Apple'), (1, 'Banana'),
    (2, 'Python'), (2, 'JavaScript')`);

  db.run(`INSERT INTO select_list_incorrect_answers (question_id, incorrect_answer) VALUES
    (1, 'Carrot'), (1, 'Potato'),
    (2, 'HTML'), (2, 'CSS')`);

  // Top Scores
  db.run(`INSERT INTO top_scores (player_name, score) VALUES
    ('Gurpreet', 100),
    ('Alice', 80),
    ('Bob', 60)`);
});

module.exports = db;
