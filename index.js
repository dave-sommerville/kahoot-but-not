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
  res.send('<h1>Welcome to Cyber Clash 🎮</h1><p>Go to <a href="gameplay/index.html">Gameplay</a> or <a href="admin/index.html">Admin</a></p> or <a href="gameplay/signUp.html">SignUp</a> or <a href="viewing/index.html">viewing</a>');
});

function getRandomQuestion(callback) {
  db.get(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`, [], (err, row) => {
    if (err) {
      console.error("Error fetching question:", err.message);
      callback(null);
    } else {
      callback(row);
    }
  });
}

function getLeaderboard(callback) {
  db.all(`SELECT name, score FROM players ORDER BY score DESC LIMIT 10`, [], (err, rows) => {
    if (err) {
      console.error(" Error fetching leaderboard:", err.message);
      callback([]);
    } else {
      callback(rows);
    }
  });
}

function emitLeaderboardUpdate() {
  getLeaderboard((leaderboard) => {
    io.emit('leaderboard-update', leaderboard); 
  });
}

const playerStates = {};
io.on('connection', (socket) => {
  socket.on('startGame', () => {
    console.log('🟢 Game started by admin');
    io.emit('gameStarted'); // Send to everyone
  });

  socket.on('pauseGame', () => {
    console.log('⏸️ Game paused by admin');
    io.emit('gamePaused');
  });

  socket.on('stopGame', () => {
    console.log('🔴 Game stopped by admin');
    io.emit('gameStopped');
  });

  console.log(' A user connected:', socket.id);

  socket.on('player-join', (nickname) => {
    socket.nickname = nickname;
    console.log(' Player joined:', nickname);

    const insertQuery = `
      INSERT OR IGNORE INTO players (name) VALUES (?)
    `;

    db.run(insertQuery, [nickname], function (err) {
      if (err) {
        console.error(' Error inserting player:', err.message);
        socket.emit('player-error', 'Database error');
        return;
      }

      console.log(` Player ${nickname} saved to DB`);
      socket.emit('player-joined', { name: nickname });
      emitLeaderboardUpdate();
      getRandomQuestion((question) => {
        if (!question) {
          socket.emit('new-question', { question_text: 'No questions available yet!' });
        } else {
          playerStates[nickname] = question;
          socket.emit('new-question', question);
          io.emit('new-question', question);
        }
      });
    });
  });

  socket.on('submit-answer', ({ nickname, answer }) => {
    console.log(` Received answer from ${nickname}: ${answer}`);

    const question = playerStates[nickname];

    if (!question || !question.correct_option) {
      console.warn(" Question is missing or not assigned to player");
      socket.emit('error', 'No active question to validate.');
      return;
    }

    const correctAnswer = question.correct_option.trim().toLowerCase();
    const userAnswer = answer.trim().toLowerCase();

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      console.log(" Correct answer!");

      db.run(`
        UPDATE players
        SET score = score + 1,
            correct_answer = correct_answer + 1
        WHERE name = ?
      `, [nickname], (err) => {
        if (err) {
          console.error(' Error updating score:', err.message);
        } else {
          console.log(` Score updated for ${nickname}`);
        }
      });

      socket.emit('answer-feedback', {
        correct: true,
        correctAnswer,
        userAnswer
      });

      emitLeaderboardUpdate();

    } else {
      console.log(" Wrong answer");
      socket.emit('answer-feedback', {
        correct: false,
        correctAnswer,
        userAnswer
      });
    }
  });

  socket.on('next-question', () => {
    const nickname = socket.nickname;
    if (!nickname) {
      socket.emit('error', 'No active player session');
      return;
    }

    getRandomQuestion((question) => {
      if (question) {
        playerStates[nickname] = question;
        socket.emit('answer-feedback', { correct: true });
        socket.emit('new-question', question);
        io.emit('new-question', question);
      } else {
        socket.emit('error', 'No more questions available');
      }
    });
  });

  socket.on('get-leaderboard', () => {
    console.log(" Fetching leaderboard...");
    getLeaderboard((leaderboard) => {
      socket.emit('leaderboard-update', leaderboard); 
    });
  });

  socket.on('disconnect', () => {
    console.log(' A user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});
