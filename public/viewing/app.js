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

const playerName = localStorage.getItem('nickname') || 'Unknown';
const selectedAvatar = localStorage.getItem('profilePic') || 'user-solid.svg'; 
if (playerName && playerName !== 'Unknown') {
  socket.emit('player-join', { name: playerName, avatar: selectedAvatar });
  console.log(`Viewer re-joined as ${playerName} with avatar ${selectedAvatar}`);
}
console.log('Emitting player-join with:', {
  name: localStorage.getItem('nickname'),
  avatar: localStorage.getItem('profilePic')
});


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

// Request the leaderboard when the page loads
socket.emit('get-leaderboard');

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
  //----- correct-----------
  // for (let i = 0; i < 3; i++) {
  //   const player = players[i];

  //   if (player) {
  //     playerNameEls[i].textContent = player.name || "Unnamed";
  //     playerStatusEls[i].textContent = "Ready";
  //     playerImgEls[i].src = player.avatar ? `../img/${player.avatar}` : "/img/user-solid.svg";
  //     console.log(`✅ Slot ${i + 1} => ${player.name} (${player.avatar})`);
  //   } else {
  //     playerNameEls[i].textContent = "Not Joined";
  //     playerStatusEls[i].textContent = "Waiting...";
  //     playerImgEls[i].src = "/img/user-solid.svg";
  //     console.log(`🟨 Slot ${i + 1} => Empty (placeholder shown)`);
  //   }
  // }
  // Ensure only the latest 3 players are shown
  const visiblePlayers = players.slice(-3); // Always show latest 3 joined

  for (let i = 0; i < 3; i++) {
    const player = visiblePlayers[i];
    
    if (player) {
      playerNameEls[i].textContent = player.name || "Unnamed";
      playerStatusEls[i].textContent = "Ready";
      playerImgEls[i].src = player.avatar ? `../img/${player.avatar}` : "/img/user-solid.svg";
    } else {
      playerNameEls[i].textContent = "Not Joined";
      playerStatusEls[i].textContent = "Waiting...";
      playerImgEls[i].src = "/img/user-solid.svg";
    }
  }
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

function updateLeaderboard(players) {
  leaderboard.innerHTML = ''; 

  players.sort((a, b) => b.score - a.score);

  players.forEach((p, i) => {
   const div = document.createElement('div');
    div.innerHTML =
      `<img src="../img/${p.avatar}" alt="${p.name}" class="leaderboard-avatar">
      ${i+1}. ${p.name} – ${p.score} pts`;
    leaderboard.appendChild(div);
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

const scoreTrigger = select('.score-trigger');
const scoreDisplay = select('.score-display');
listen("click", scoreTrigger, () =>{
  scoreDisplay.classList.toggle('open');
});
