'use strict';
const socket = io();

// const nickname = prompt("Enter your nickname");
// socket.emit('player-joined', nickname);
// const profilePicture = "https://example.com/default-profile.png"; // Replace with your actual image URL or local path

// Emit player joined with nickname and profile picture
// socket.emit('player-joined', { nickname, profilePicture });
document.querySelector('.select-name').addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim();
  if (!name) {
    alert("Please enter your name!");
    return;
  }

  const profilePicture = "https://example.com/default-profile.png"; // or grab from selection logic
  socket.emit('player-joined', { nickname: name, profilePicture });

  console.log("🔵 Player emitted:", name);
});
// Submit answer
function submitAnswer(isCorrect) {
  socket.emit('submit-answer', { nickname, isCorrect });
}

// Request leaderboard
function getLeaderboard() {
  socket.emit('request-leaderboard');
  socket.on('leaderboard-data', (data) => {
    console.log("Leaderboard:", data);
    // You can display it in your HTML
  });
}
