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


function sendAdminCommand(cmd) {
  socket.emit('admin-action', cmd); // e.g. "skip", "restart", etc.
}
const socket = io(); // default namespace

const startBtn = document.getElementById('startGameBtn');
const cancelBtn = document.getElementById('cancelGameBtn');

listen('click', startBtn, () => {
  socket.emit('admin-action', { type: 'start-game' });
});

listen('click', cancelBtn, () => {
  socket.emit('admin-action', { type: 'cancel-game' });
});

// Request the leaderboard when the page loads
socket.emit('get-leaderboard');

// Handle leaderboard update
socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
  updateLobbyPlayers(players);  // new function to update name display
});


socket.on('new-question', (question) => {
  console.log("🟢 New Question Received:", question);

  document.querySelector('.question-text').innerText = question.question_text;
  document.querySelector('.opt-one-txt').innerText = question.option_a;
  document.querySelector('.opt-two-txt').innerText = question.option_b;
  document.querySelector('.opt-three-txt').innerText = question.option_c;
  document.querySelector('.opt-four-txt').innerText = question.option_d;
  document.getElementById('answer').value = '';
});


// Listen for question updates from the server
socket.on('new-question', (question) => {
  console.log("Got questions!"); 
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
  // players.sort((a, b) => b.score - a.score);

  players.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;
    leaderboard.appendChild(entry);
  });
}

const playerClassMap = ['one', 'two', 'three'];

function updateLobbyPlayers(players) {
  for (let i = 0; i < 3; i++) {
    const name = players[i]?.name || "Unnamed";
    const status = players[i] ? "Connected" : "Unoccupied";

    const nameEl = document.querySelector(`.player-${playerClassMap[i]}`);
    const statusEl = document.querySelector(`.player-${playerClassMap[i]}-status`);

    if (nameEl) nameEl.textContent = name;
    if (statusEl) statusEl.textContent = status;
  }
}

const scoreTrigger = select('.score-trigger');
const scoreDisplay = select('.score-display');
listen("click", scoreTrigger, () =>{
  scoreDisplay.classList.toggle('open');
});

const form = document.getElementById('questionForm');
const formStatus = document.getElementById('formStatus');

// form.addEventListener('submit', (e) => {
//   e.preventDefault();

//   const question = {
//     question_text: document.getElementById('question_text').value,
//     option_a: document.getElementById('option_a').value,
//     option_b: document.getElementById('option_b').value,
//     option_c: document.getElementById('option_c').value,
//     option_d: document.getElementById('option_d').value,
//     correct_option: document.getElementById('correct_option').value.toUpperCase()
//   };

//   socket.emit('add-question', question);
// });