'use strict';
// PURPOSE: SERVER - EXPRESS AND SOCKET.IO

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const db = require('./db');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(express.static('public')); // Serve static files
// app.use(express.json());           // Enable JSON body parsing

// // Add a player via REST API
// app.post('/add-player', (req, res) => {
//   const { name } = req.body;
//   db.run('INSERT INTO players(name) VALUES(?)', [name], function (err) {
//     if (err) return res.status(500).send(err.message);
//     res.json({ id: this.lastID });
//   });
// });

// // Socket.IO for real-time messages
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('answer', (data) => {
//     console.log(`${data.name} answered: ${data.answer}`);
//     // Add scoring logic later
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// server.listen(3000, () => {
//   console.log('Server running at http://localhost:3000');
// });


// index.js
'use strict';
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Cyber Clash 🎮</h1><p>Go to <a href="gameplay/index.html">Gameplay</a> or <a href="admin/index.html">Admin</a></p>');
});

// Sockets
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Player joins
  // socket.on('player-joined', (nickname) => {
  //   db.run('INSERT OR IGNORE INTO players (name) VALUES (?)', [nickname], (err) => {
  //     if (err) console.error(err);
  //   });
  // });

  socket.on('player-joined', ({ nickname, profile_pic }) => {
   db.run(`
    INSERT OR IGNORE INTO players (name, profile_pic, score, correct_answers)
    VALUES (?, ?, 0, 0)`, [nickname, profile_pic], (err) => {
      if (err) {
        console.error("DB insert error:", err.message);
      } else {
        console.log(`🟢 Player added: ${nickname}`);
      }
    });
  });

  // Answer submission
  socket.on('submit-answer', ({ nickname, isCorrect }) => {
    if (isCorrect) {
      db.run(`UPDATE players SET score = score + 10, correct_answers = correct_answers + 1 WHERE name = ?`, [nickname], (err) => {
        if (err) console.error(err);
      });
    }
  });

  // Leaderboard request
  socket.on('request-leaderboard', () => {
    db.all(`SELECT name as nickname, score, correct_answers FROM players ORDER BY score DESC`, [], (err, rows) => {
      if (!err) {
        socket.emit('leaderboard-data', rows);
      }
    });
  });

  // New: Request a random question (MCQ or True/False)
  socket.on('request-question', () => {
    // Randomly choose a question type: 0 for MCQ, 1 for True/False
    const type = Math.round(Math.random()); 
    
    if (type === 0) { // MCQ
      // Get a random MCQ question along with its incorrect answers
      db.get(`SELECT * FROM mcq_questions ORDER BY RANDOM() LIMIT 1`, [], (err, question) => {
        if (err || !question) return;
        db.all(`SELECT incorrect_answer FROM mcq_incorrect_answers WHERE question_id = ?`, [question.id], (err, incorrectAnswers) => {
          if (err) return;
          // Format the question data to include both correct and incorrect options
          const options = [question.correct_answer, ...incorrectAnswers.map(row => row.incorrect_answer)];
          // Shuffle the options array
          options.sort(() => Math.random() - 0.5);
          socket.emit('new-question', { type: 'mcq', question: question.question, options, correctAnswer: question.correct_answer });
        });
      });
    } else { // True/False
      db.get(`SELECT * FROM true_false_questions ORDER BY RANDOM() LIMIT 1`, [], (err, question) => {
        if (err || !question) return;
        // True/False questions have fixed options
        socket.emit('new-question', { type: 'truefalse', question: question.question, options: ['True', 'False'], correctAnswer: question.correct_answer ? 'True' : 'False' });
      });
    }
  });

  // Admin controls (skip, restart, etc.)
  socket.on('admin-action', (action) => {
    io.emit('admin-action', action); // Broadcast admin actions to all clients
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
