'use strict';
function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const socket = io(); 
const questionText = document.getElementById('question-text');
const leaderboard = document.getElementById('leaderboard');


socket.emit('get-leaderboard');

socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
});

socket.on('new-question', (question) => {
  // const questionText = document.getElementById('question-text');
  if (questionText && question && question.question_text) {
    questionText.textContent = question.question_text;
  } else {
    questionText.textContent = 'No questions available';
  }
});

function updateLeaderboard(players) {
  // const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = ''; 

  players.sort((a, b) => b.score - a.score);

  players.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;
    leaderboard.appendChild(entry);
  });
}
