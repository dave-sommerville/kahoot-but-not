const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Serve everything from /public
app.use(express.static("public"));

const players = [];

io.on("connection", (socket) => {
  console.log(" A user connected");

  // Handle new player join
  socket.on("player-join", (nickname) => {
    console.log("New player joined:", nickname);

    // Avoid duplicates
    if (!players.includes(nickname)) {
      players.push(nickname);
    }

    // Confirm back to player
    socket.emit("player-joined", { name: nickname });

    // Broadcast to all viewing screens
    io.emit("leaderboard-data", players.map((name, index) => ({
      name,
      score: 0 
    })));
  });

  // Handle answer submission
  socket.on("submit-answer", ({ nickname, answer }) => {
    const correctAnswer = "42"; // Hardcoded
    const isCorrect = answer === correctAnswer;
    socket.emit("answer-feedback", { correct: isCorrect, correctAnswer });

    console.log(`Player ${nickname} submitted: ${answer}. Correct: ${isCorrect}`);
  });

  // Optional: Respond to polling from viewer
  socket.on("request-leaderboard", () => {
    io.emit("leaderboard-data", players.map((name) => ({
      name,
      score: 0 
    })));
  });
});

server.listen(PORT, () => {
  console.log(`🔹 Server running on http://localhost:${PORT}`);
});
