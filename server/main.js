'use strict';

let players = {}; // nickname -> { avatar, socketId } for local leaderboard
let questionList = []; // wdweofdeu
let currentQuestionIndex = 0;
let activeResponses = {}; // nickname -> { answer, socketId } to keep track of answers 
let gameStarted = false; // Flag to track if game has started

let MAX_QUESTIONS = 5; // Default value, can be overridden by admin
let questionsAsked = 0;

// Handles question logic 
function startNextQuestion(io, db, adminLogic) {
  if (currentQuestionIndex >= questionList.length || questionsAsked >= MAX_QUESTIONS) {
    console.log("✅ Game Over - Reached end or question limit.");

    // Reset logic
    gameStarted = false;
    currentQuestionIndex = 0;
    activeResponses = {};
    players = {};
    questionsAsked = 0;

    adminLogic.clearLobby();

    io.emit('quiz-complete');
    io.emit('reset-client');
    return;
  }

  questionsAsked++; // Track the number of questions sent

  const question = questionList[currentQuestionIndex++];
  activeResponses = {}; // Reset for new question

  io.emit('new-question', {
    question_text: question.question_text,
    question_type: question.question_type,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    time: 15
  });

  console.log("🟢 Sent question:", question.question_text);

  // Wait for 15 seconds for answers
  setTimeout(() => {
    const correctAnswer = question.correct_option.trim().toLowerCase();

    for (let nickname in activeResponses) {
      const { answer, socketId } = activeResponses[nickname];
      const userAnswer = (answer || '').trim().toLowerCase();
      const isCorrect = userAnswer === correctAnswer;

      // Runs correct check, updates db 
      if (isCorrect) {
        db.run(`UPDATE players SET score = score + 1 WHERE name = ?`, [nickname], (err) => {
          if (err) console.error("❌ Score update error:", err.message);
        });
        console.log(`✅ ${nickname} answered correctly!`);
      }

      // Send feedback
      db.get(`SELECT score FROM players WHERE name = ?`, [nickname], (err, row) => {
        const score = row?.score || 0;
        if (socketId) {
          io.to(socketId).emit('answer-feedback', {
            correct: isCorrect,
            correctAnswer,
            userAnswer,
            score
          });
        }

        if (err) console.error("❌ Score retrieval error:", err.message);
      });
    }
    // Sends next question when admin says so 
    io.emit('awaiting-admin-next');

  }, 15000);
}

// Just adds user answer to active responses
function handleAnswerSubmission({ nickname, answer, socket }) {
  if (!gameStarted) {
    socket.emit('player-error', 'Game has not started yet');
    return;
  }
  if (!(nickname in activeResponses)) {
    activeResponses[nickname] = {
      answer,
      socketId: socket.id
    };
    console.log(`📨 ${nickname} answered: ${answer}`);
  }
}

// Sets up global variables and loads questions from the database
function setupGlobals(io, db) {
  db.all("SELECT * FROM questions ORDER BY id ASC", (err, rows) => {
    if (err || rows.length === 0) {
      console.error("❌ Failed to load questions:", err?.message || 'No questions found');
    } else {
      questionList = rows;
      console.log("📚 Questions loaded:", rows.length);
      // ⛔️ Do NOT start the game here
    }
  });
}

// All the 
module.exports = (io, socket, db, adminLogic) => {
  socket.on('player-join', ({ nickname, avatar }) => {
    if (players[nickname]) {
      socket.emit('player-error', 'Nickname already taken');
      return;
    }
    const success = adminLogic.registerPlayer(socket, { nickname, avatar });

    if (success) {
    socket.emit('player-joined');
    } else {
      socket.emit('lobby-full');
    }

    players[nickname] = {
      avatar,
      socketId: socket.id
    };

    db.run(`INSERT OR IGNORE INTO players (name, avatar) VALUES (?, ?)`, [nickname, avatar], (err) => {
      if (err) {
        socket.emit('player-error', 'Database error');
      } else {
        socket.emit('player-joined');
        console.log(`👤 Player joined: ${nickname}`);
      }
    });
  });

  socket.on('submit-answer', ({ nickname, answer }) => {
    if (!nickname || !answer) return;
    if (!(nickname in players)) {
      socket.emit('player-error', 'You are not registered');
      return;
    }
    handleAnswerSubmission({ nickname, answer, socket });
  });

  // Get the global leaderboard
  socket.on('get-global-leaderboard', () => {
    db.all(`SELECT name, avatar, score FROM players ORDER BY score DESC LIMIT 10`, (err, rows) => {
      if (err) {
        socket.emit('leaderboard-error', 'Failed to load leaderboard');
        console.error("❌ Leaderboard error:", err.message);
      } else {
        socket.emit('global-leaderboard-data', rows);
      }
    });
  });

  // get the local leaderboard for the current game
  socket.on('get-leaderboard', () => {
    const nicknames = Object.keys(players);

    if (nicknames.length === 0) {
      socket.emit('leaderboard-update', []);
      return;
    }

    const placeholders = nicknames.map(() => '?').join(',');
    const query = `SELECT name, avatar, score FROM players WHERE name IN (${placeholders}) ORDER BY score DESC`;

    db.all(query, nicknames, (err, rows) => {
      if (err) {
        console.error("❌ Current leaderboard error:", err.message);
        socket.emit('leaderboard-error', 'Failed to load current leaderboard');
      } else {
        io.emit('leaderboard-update', rows); // send to all players
      }
    });
  });

  // Handles admin commands
  socket.on('admin-command', (cmd) => {
    adminLogic.handleAdminCommand(io, cmd);
  });

  socket.on('admin-start-game', () => {
    if (!gameStarted) {
      console.log("🎮 Game Started by Admin");
      gameStarted = true;
      currentQuestionIndex = 0;

      // Send current players to admin (after game starts)
      const currentPlayerList = Object.entries(players).map(([nickname, { avatar }]) => ({
        name: nickname,
        avatar
      }));
      io.emit('current-players', currentPlayerList); // ← New

      startNextQuestion(io, db, adminLogic);
    }
  });

  // Admin says next question 
  socket.on('admin-next-question', () => {
  if (gameStarted) {
    startNextQuestion(io, db, adminLogic);
  } else {
    console.log("Admin attempted to send next question before game started.");
  }

  // Admin defines new question count
  socket.on('admin-set-question-count', (count) => {
    if (typeof count === 'number' && count > 0 && count <= questionList.length) {
      MAX_QUESTIONS = count;
      console.log(`🛠 Admin set game to ${MAX_QUESTIONS} questions`);
      io.emit('question-count-updated', MAX_QUESTIONS); // Optional: update clients
    } else {
      console.warn("❌ Invalid question count from admin");
    }
  });
});

};

module.exports.setup = setupGlobals;
