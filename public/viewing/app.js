'use strict';
function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const socket = io(); 
console.log('Nickname:', localStorage.getItem('nickname'));
console.log('Avatar:', localStorage.getItem('profilePic'));
const questionText = document.getElementById('question-text');
const leaderboard = document.getElementById('leaderboard');

// Auto-refresh
setInterval(() => {
  socket.emit('request-leaderboard');
}, 5000); // update every 5 seconds

function updateLeaderboardUI(data, targetSelector) {
  const container = document.querySelector(targetSelector);
  container.innerHTML = "";

  data.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.className = "leaderboard-entry";

    const avatar = document.createElement('img');
    avatar.src = player.avatar || "../img/user-solid.svg";
    avatar.className = "avatar-icon";

    const text = document.createElement('span');
    text.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;

    entry.appendChild(avatar);
    entry.appendChild(text);
    container.appendChild(entry);
  });
}
'use strict';

setInterval(() => {
  // Ask the server for the global leaderboard
  socket.emit('get-global-leaderboard');
  // Request the leaderboard when the page loads
  socket.emit('get-leaderboard');
}, 5000); // Update every 5 seconds


// Listen for response
socket.on('leaderboard-update', (players) => {
  updateLeaderboardUI(players, '.current-game-leaderboard');
});

socket.on('global-leaderboard-data', (players) => {
  updateLeaderboardUI(players, '.global-leaderboard');
});

// When we get the leaderboard 
socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
  updateLobbyPlayers(players);  // new function to update name display
});

socket.on('viewer-update-players', (players) => {
  const playerNameEls = [
    document.querySelector('.player-one'),
    document.querySelector('.player-two'),
    document.querySelector('.player-three')
  ];
  const playerStatusEls = [
    document.querySelector('.player-one-status'),
    document.querySelector('.player-two-status'),
    document.querySelector('.player-three-status')
  ];
  const playerImgEls = [
    document.querySelector('.player-one-avatar'),
    document.querySelector('.player-two-avatar'),
    document.querySelector('.player-three-avatar')
  ];

  players.forEach((player, index) => {
    console.log("Rendering player:", player.name, "Avatar:", player.avatar);
    if (playerNameEls[index]) {
      playerNameEls[index].textContent = player.name || "Unnamed";
      playerStatusEls[index].textContent = "Ready";

      if (player.avatar) {
        playerImgEls[index].src = `../img/${player.avatar}`;
        console.log("Image source set to:", playerImgEls[index].src);
      } else {
        playerImgEls[index].src = '/img/user-solid.svg';
      }
      console.log(`✅ Player ${index + 1} => Name: ${player.name}, Avatar: ${player.avatar}`);
    }
  });
});


socket.on('new-question', (question) => {
  if (questionText && question && question.question_text) {
    questionText.textContent = question.question_text;
  } else {
    questionText.textContent = 'No questions available';
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

// function updateLeaderboard(players) {
//   // const leaderboard = document.getElementById('leaderboard');
//   leaderboard.innerHTML = ''; 

//   players.sort((a, b) => b.score - a.score);

//   players.forEach((player, index) => {
//     const entry = document.createElement('div');
//     entry.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;
//     leaderboard.appendChild(entry);
//   });

//     players.forEach((player, index) => {
//     const entry = document.createElement('div');
//     entry.classList.add('leaderboard-entry');

//     const avatarImg = document.createElement('img');
//     avatarImg.src = (player.avatar && player.avatar !== 'null') ? player.avatar : "../img/user-solid.svg";
//     avatarImg.classList.add('avatar-icon');

//     const text = document.createElement('span');
//     text.textContent = `${index + 1}. ${player.name} - ${player.score} pts`;

//     entry.appendChild(avatarImg);
//     entry.appendChild(text);
//     leaderboard.appendChild(entry);
//   });
// }

// const playerClassMap = ['one', 'two', 'three'];
// function updateLobbyPlayers(players) {
//   for (let i = 0; i < 3; i++) {
//     const name = players[i]?.name || "Unnamed";
//     const avatar = (players[i]?.avatar && players[i].avatar !== 'null') ? players[i].avatar : "../img/user-solid.svg";
//     const status = players[i] ? "Connected" : "Unoccupied";

//     const nameEl = document.querySelector(`.player-${playerClassMap[i]}`);
//     const statusEl = document.querySelector(`.player-${playerClassMap[i]}-status`);
//     const avatarEl = document.querySelector(`.player-${playerClassMap[i]}-icon`);

//     if (nameEl) nameEl.textContent = name;
//     if (statusEl) statusEl.textContent = status;
//     if (avatarEl) avatarEl.src = avatar;
//   }
// }



// Receive lobby updates
socket.on('lobby-update', (players) => {
  const slots = [
    document.getElementById('player-slot-1'),
    document.getElementById('player-slot-2'),
    document.getElementById('player-slot-3'),
  ];

  slots.forEach((slot) => {
    slot.querySelector('h4').textContent = 'Unoccupied';
    slot.querySelector('img').src = '../img/user-solid.svg';
    slot.querySelector('p').textContent = 'Unnamed';
  });

  players.forEach((player, i) => {
    if (slots[i]) {
      slots[i].querySelector('h4').textContent = 'Ready!';
      slots[i].querySelector('img').src = player.avatar || '../img/user-solid.svg';
      slots[i].querySelector('p').textContent = player.name;
    }
  });
});

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
