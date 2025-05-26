// 'use strict';
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const path = require('path');
// const db = require('./server/db');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// const PORT = 3000;

// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.send(`
//     <h1>Welcome to Cyber Clash 🎮</h1>
//     <p>
//       Go to 
//       <a href="/gameplay/index.html">Gameplay</a>, 
//       <a href="/admin/index.html">Admin</a>, or 
//       <a href="/viewing/index.html">Viewing</a>
//     </p>
//   `);
// });

// // --- Helper Functions ---
// function getRandomQuestion(callback) {
//   db.get(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`, [], (err, row) => {
//     if (err) {
//       console.error("Error fetching question:", err.message);
//       console.error("Error fetching question:", err.message);
//       callback(null);
//     } else {
//       callback(row);
//     }
//   });
// }

// function getLeaderboard(callback) {
//   db.all(`SELECT name, score, avatar FROM players ORDER BY score DESC LIMIT 10`, [], (err, rows) => {
//     if (err) {
//       console.error("Error fetching leaderboard:", err.message);
//       callback([]);
//     } else {
//       callback(rows);
//     }
//   });
// }

// function emitLeaderboardUpdate() {
//   getLeaderboard((leaderboard) => {
//     io.emit('leaderboard-update', leaderboard);
//   });
// }

// const playerStates = {}; // Stores current question per player

// // --- Main Socket.IO logic ---
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('player-join', ({ nickname, avatar }) => {
//     db.run(`INSERT OR IGNORE INTO players (name, avatar) VALUES (?, ?)`, [nickname, avatar], (err) => {
//       if (err) {
//         console.error('Error inserting player:', err.message);
//         socket.emit('player-error', 'Database error');
//         return;
//       }
//       socket.emit('player-joined', { name: nickname, avatar });
//       emitLeaderboardUpdate();

//       playerStates[nickname] = { avatar };

//       io.emit('player-update', { name: nickname, avatar });

//       getRandomQuestion((question) => {
//         playerStates[nickname] = question || { question_text: 'No questions available yet!' };
//         io.emit('new-question', playerStates[nickname]);
//       });
//     });
//   });

//   socket.on('submit-answer', ({ nickname, answer }) => {
//     const question = playerStates[nickname];
//     if (!question || !question.correct_option) {
//       socket.emit('error', 'No active question');
//       return;
//     }

//     const correctAnswer = question.correct_option.trim().toLowerCase();
//     const userAnswer = answer.trim().toLowerCase();

//     const isCorrect = userAnswer === correctAnswer;

//     if (isCorrect) {
//       console.log(" Correct answer!");

//       db.run(`
//         UPDATE players
//         SET score = score + 1,
//             correct_answer = correct_answer + 1
//         WHERE name = ?
//       `, [nickname], (err) => {
//         if (err) {
//           console.error(' Error updating score:', err.message);
//         } else {
//           console.log(` Score updated for ${nickname}`);
//         }
//       });

//       socket.emit('answer-feedback', {
//         correct: true,
//         correctAnswer,
//         userAnswer
//       });

//       emitLeaderboardUpdate();

//     } else {
//       console.log(" Wrong answer");
//       socket.emit('answer-feedback', {
//         correct: false,
//         correctAnswer,
//         userAnswer
//       });
//     }
//   });

//   socket.on('next-question', () => {
//     const nickname = socket.nickname;
//     if (!nickname) {
//       socket.emit('error', 'No active player session');
//       return;
//     }

//     getRandomQuestion((question) => {
//       if (question) {
//         playerStates[nickname] = question;
//         socket.emit('answer-feedback', { correct: true });
//         socket.emit('new-question', question);
//         io.emit('new-question', question);
//       } else {
//         socket.emit('error', 'No more questions available');
//       }
//     });
//   });

//   socket.on('get-leaderboard', () => {
//     getLeaderboard((players) => {
//       socket.emit('leaderboard-update', players.map(p => ({
//         name: p.name,
//         score: p.score,
//         avatar: p.avatar || '../img/user-solid.svg'
//       })));
//     });
//   });

//   socket.on('get-question', () => {
//         getRandomQuestion((question) => {
//           if (question) {
//             io.emit('new-question', question);
//           }
//     });
//   }); 

//   socket.on('add-question', (data) => {
//     const { question_text, option_a, option_b, option_c, option_d, correct_option } = data;
//     if (!question_text || !correct_option) {
//       socket.emit('form-status', 'Missing required fields');
//       return;
//     }

//     db.run(`
//       INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option)
//       VALUES (?, ?, ?, ?, ?, ?)`,
//       [question_text, option_a, option_b, option_c, option_d, correct_option],
//       (err) => {
//         if (err) {
//           console.error('Failed to add question:', err.message);
//           socket.emit('form-status', 'Error saving question');
//         } else {
//           socket.emit('form-status', '✅ Question added successfully!');
//         }
//       }
//     );
//   });

//   socket.on('broadcast-new-question', () => {
//     getRandomQuestion((question) => {
//       if (question) {
//         io.emit('new-question', question);
//       }
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// // --- Start Server ---
// server.listen(PORT, () => {
//   console.log(`Server running at http://192.168.2.36:${PORT}`);
// });
// setInterval(emitLeaderboardUpdate, 5000);
// // setInterval(() => {
// //   getRandomQuestion((question) => {
// //     if (question) {
// //       io.emit('new-question', question);
// //     }
// //   });
// // }, 5000);
