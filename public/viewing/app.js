'use strict';

const socket = io();

socket.on('leaderboard-data', (data) => {
  updateLeaderboardUI(data); // Implement this to update the DOM
});

// Auto-refresh
setInterval(() => {
  socket.emit('request-leaderboard');
}, 5000); // update every 5 seconds
