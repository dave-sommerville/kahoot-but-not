'use strict';
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
'use strict';

/*------------------------------------------------------------------------->
  Utility Functions 
<-------------------------------------------------------------------------*/

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function selectAll(selector, scope = document) {
  return scope.querySelectorAll(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function addClass(element, customClass) {
  element.classList.add(customClass);
  return element;
}

function removeClass(element, customClass) {
  element.classList.remove(customClass);
  return element;
}

function sleep(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

function createImage(imageSrc) {
  const img = document.createElement('img');
  img.src = imageSrc;  
  img.alt = imageSrc; // Because the photo could be anything 
  return img;
}

function create(element) {
  const newElement = document.createElement(element); 
  return newElement;
}

const scoreTrigger = select('.score-trigger');
const scoreDisplay = select('.score-display');
listen("click", scoreTrigger, () =>{
  scoreDisplay.classList.toggle('open');
});