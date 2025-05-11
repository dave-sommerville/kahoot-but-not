'use strict';
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Cyber Clash 🎮</h1><p>Go to <a href="gameplay/index.html">Gameplay</a> or <a href="admin/index.html">Admin</a></p>');
});

// Helper to fetch a random question
function getRandomQuestion(callback) {
  db.get(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`, [], (err, row) => {
    if (err) {
      console.error(" Error fetching question:", err.message);
      callback(null);
    } else {
      callback(row);
    }
  });
}


io.on('connection', (socket) => {
  console.log(' A user connected:', socket.id);

  socket.on('player-join', (name) => {
    console.log('Player emitted:', name);

    // Insert or ignore player (no duplicates)
    const insertQuery = `
      INSERT OR IGNORE INTO players (name) VALUES (?)
    `;

    db.run(insertQuery, [name], function (err) {
      if (err) {
        console.error('Error inserting player:', err.message);
        socket.emit('player-error', 'Database error');
      } else {
        console.log(`Player ${name} saved to DB`);
        socket.emit('player-joined', { name });

        // Send a random question after successful join
        db.get('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1', [], (err, questions) => {
          if (err || !questions) {
            console.error('Error fetching question:', err?.message || 'No question found');
            socket.emit('new-question', { question_text: 'No questions available yet!' });
          } else {
            socket.emit('new-question', questions);
          }
        });
      }
    });
  });

  socket.on('submit-answer', ({ playerName, questionId, selectedOption }) => {
    // Get player ID
    db.get('SELECT id FROM players WHERE name = ?', [playerName], (err, player) => {
      if (err || !player) return console.error('Player not found:', err);

      const playerId = player.id;

      // Get correct answer for the question
      db.get('SELECT correct_option FROM questions WHERE id = ?', [questionId], (err, questions) => {
        if (err || !questions) return console.error('Question not found:', err);

        const isCorrect = questions.correct_option === selectedOption;

        // Save player answer
        db.run(`
          INSERT INTO player_answers (player_id, question_id, selected_option, is_correct)
          VALUES (?, ?, ?, ?)
        `, [playerId, questionId, selectedOption, isCorrect ? 1 : 0]);

        // Update score if correct
        if (isCorrect) {
          db.run(`
            UPDATE players SET 
              score = score + 1,
              correct_answer = correct_answer + 1
            WHERE id = ?
          `, [playerId]);
        }
      });
    });
  });

  socket.on('disconnect', () => {
    console.log(' A user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});
