'use strict';

/*------------------------------------------------------------------------->
  Utility Functions 
<-------------------------------------------------------------------------*/

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function isImageFile(file) {
  return file && file.type.startsWith('image');
}


// const socket = io();
// const button = select('.submit');

// function submitAnswer() {
//   const name = document.getElementById('playerName').value;
//   const answer = document.getElementById('answer').value;
//   socket.emit('answer', { name, answer });
// }

// listen("click", button, () => {
//   submitAnswer();
// });


function sendAdminCommand(cmd) {
  socket.emit('admin-action', cmd); // e.g. "skip", "restart", etc.
}
const socket = io(); // Connect to the server

// Request the leaderboard when the page loads
socket.emit('get-leaderboard');

// Handle leaderboard update
socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
});

// Listen for question updates from the server
socket.on('new-question', (question) => {
  const questionText = document.getElementById('question-text');
  if (questionText && question && question.question_text) {
    questionText.textContent = question.question_text;
  } else {
    questionText.textContent = 'No questions available';
  }
});

// Leaderboard update logic
function updateLeaderboard(players) {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = ''; // Clear existing content

  // Optional: sort players by score in descending order
  players.sort((a, b) => b.score - a.score);

  players.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;
    leaderboard.appendChild(entry);
  });
}

const scoreTrigger = select('.score-trigger');
const scoreDisplay = select('.score-display');
listen("click", scoreTrigger, () =>{
  scoreDisplay.classList.toggle('open');
});