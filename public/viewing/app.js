'use strict';

socket.on('leaderboard-data', (data) => {
  updateLeaderboardUI(data); // Implement this to update the DOM
});

// Auto-refresh
setInterval(() => {
  socket.emit('request-leaderboard');
}, 5000); // update every 5 seconds

function updateLeaderboardUI(data) {
  const highScoresList = document.querySelector('.high-scores');
  highScoresList.innerHTML = ""; // Clear the list first

  data.forEach((player, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${player.name} - ${player.score}`;
    highScoresList.appendChild(li);
  });

  // Optional: Populate fixed slots too
  const fixedSlots = document.querySelectorAll('.current-scores > div');
  fixedSlots.forEach((slot, i) => {
    if (data[i]) {
      slot.querySelector('h4').textContent = data[i].name;
      slot.querySelector('p').textContent = `Score: ${data[i].score}`;
    } else {
      slot.querySelector('h4').textContent = "";
      slot.querySelector('p').textContent = "";
    }
  });
}

'use strict';
const socket = io(); // default namespace

// Request the leaderboard when the page loads
socket.emit('get-leaderboard');

// Handle leaderboard update
socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
  updateLobbyPlayers(players);  // new function to update name display
});

socket.on('player-update', ({ name, avatar }) => {
  const nameEls = [...document.querySelectorAll('.player-one, .player-two, .player-three')];
  const iconEls = [...document.querySelectorAll('.player-one-icon, .player-two-icon, .player-three-icon')];

  for (let i = 0; i < nameEls.length; i++) {
    // Prevent duplicates
    if (nameEls[i].textContent === name) return;

    // Fill in first empty slot
    if (nameEls[i].textContent === "Unnamed") {
      nameEls[i].textContent = name;
      iconEls[i].src = avatar || "../img/user-solid.svg";
      break;
    }
  }
});

socket.emit('get-question');

// Listen for question updates from the server
socket.on('new-question', (question) => {
  console.log("🟢 New Question Received:", question);
  document.querySelector('.question-text').innerText = question.question_text;
  document.querySelector('.opt-one-txt').innerText = question.option_a;
  document.querySelector('.opt-two-txt').innerText = question.option_b;
  document.querySelector('.opt-three-txt').innerText = question.option_c;
  document.querySelector('.opt-four-txt').innerText = question.option_d;
  // document.getElementById('answer').value = '';
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

    players.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.classList.add('leaderboard-entry');

    const avatarImg = document.createElement('img');
    avatarImg.src = (player.avatar && player.avatar !== 'null') ? player.avatar : "../img/user-solid.svg";
    avatarImg.classList.add('avatar-icon');

    const text = document.createElement('span');
    text.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;

    entry.appendChild(avatarImg);
    entry.appendChild(text);
    leaderboard.appendChild(entry);
  });
}

const playerClassMap = ['one', 'two', 'three'];
function updateLobbyPlayers(players) {
  for (let i = 0; i < 3; i++) {
    const name = players[i]?.name || "Unnamed";
    const avatar = (players[i]?.avatar && players[i].avatar !== 'null') ? players[i].avatar : "../img/user-solid.svg";
    const status = players[i] ? "Connected" : "Unoccupied";

    const nameEl = document.querySelector(`.player-${playerClassMap[i]}`);
    const statusEl = document.querySelector(`.player-${playerClassMap[i]}-status`);
    const avatarEl = document.querySelector(`.player-${playerClassMap[i]}-icon`);

    if (nameEl) nameEl.textContent = name;
    if (statusEl) statusEl.textContent = status;
    if (avatarEl) avatarEl.src = avatar;
  }
}



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

