'use strict';

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function isImageFile(file) {
  return file && file.type.startsWith('image');
}

const socket = io(); 
const scoreTrigger = select('.score-trigger');
const scoreDisplay = select('.score-display');
const startBtn = select('.start');
const pauseBtn = select('.pause');
const stopBtn = select('.stop');
// function sendAdminCommand(cmd) {
//   socket.emit('admin-action', cmd); // e.g. "skip", "restart", etc.
// }

listen('click', startBtn, () => {
  socket.emit('startGame');
});

listen('click', pauseBtn, () => {
  socket.emit('pauseGame');
});

listen('click', stopBtn, () => {
  socket.emit('stopGame');
});

socket.emit('get-leaderboard');

socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
});

socket.on('new-question', (question) => {
  const questionText = document.getElementById('question-text');
  if (questionText && question && question.question_text) {
    questionText.textContent = question.question_text;
  } else {
    questionText.textContent = 'No questions available';
  }
});

function updateLeaderboard(players) {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = ''; 

  players.sort((a, b) => b.score - a.score);

  // players.forEach((player, index) => {
  //   const entry = document.createElement('div');
  //   entry.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;
  //   leaderboard.appendChild(entry);
  // });
  players.forEach((p, i) => {
    const div = document.createElement('div');
    div.innerHTML =
      `<img src="../img/${p.avatar}">
       ${i+1}. ${p.name} – ${p.score} pts`;
    leaderboard.appendChild(div);
  });
}

listen("click", scoreTrigger, () =>{
  scoreDisplay.classList.toggle('open');
});
