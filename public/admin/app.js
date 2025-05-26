'use strict';


/*------------------------------------------------------------------------->
  Utility Functions 
<-------------------------------------------------------------------------*/

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, element, callback) {
  return element?.addEventListener?.(event, callback);
}

function isImageFile(file) {
  return file && file.type?.startsWith?.('image');
}


function sendAdminCommand(cmd) {
  socket.emit('admin-action', cmd); // e.g. "skip", "restart", etc.
}
const socket = io(); // default namespace

const startBtn = document.getElementById('startGameBtn');
const cancelBtn = document.getElementById('cancelGameBtn');

listen('click', startBtn, () => {
  socket.emit('admin-command', { type: 'start-game' });
  socket.emit('admin-start-game');
});

listen('click', cancelBtn, () => {
  socket.emit('admin-command', { type: 'cancel-game' });
});

// Set number of questions 
const setCountBtn = document.getElementById('setQuestionCountBtn');
const questionCountInput = document.getElementById('questionCount');

listen('click', setCountBtn, () => {
  const count = parseInt(questionCountInput.value, 10);
  if (count > 0) {
    socket.emit('admin-set-question-count', count);
  } else {
    alert("Please enter a valid number of questions.");
  }
});


// Next question 
const nextQBtn = document.getElementById('nextQuestionBtn');

// Should ask for next question 
listen('click', nextQBtn, () => {
  socket.emit('admin-next-question');
});

// If the server is waiting for the admin to press next
socket.on('awaiting-admin-next', () => {
  // Can use UI or element to display it 
  alert("Players have answered. Press 'Next Question' to continue.");
});

/*--Player Display Updatess--*/

// Live update of current players in lobby
socket.on('current-players', (players = []) => {
  const container = document.querySelector('.admin-player-list');
  if (!container) return;

  container.innerHTML = '';

  players.forEach(({ name, avatar }) => {
    const div = document.createElement('div');
    div.classList.add('player-slot');

    const safeName = name || 'Unnamed';
    const safeAvatar = avatar || '../img/user-solid.svg';

    div.innerHTML = `
      <img src="${safeAvatar}" onerror="this.src='../img/user-solid.svg'" />
      <span>${safeName}</span>
    `;
    container.appendChild(div);
  });
});

// Slots update for admin view
socket.on('leaderboard-update', (players = []) => {
  const slotIds = ['player-slot-1', 'player-slot-2', 'player-slot-3'];

  slotIds.forEach((id, index) => {
    const slot = document.getElementById(id);
    if (!slot) {
      console.log(`Slot with ID ${id} not found. Skipping update.`);
      return; 
     } // Ensure element exists

    const h4 = slot.querySelector('h4');
    const img = slot.querySelector('img');
    const p = slot.querySelector('p');

    console.log(`Updating slot: ${id}, Index: ${index}, Player:`, players[index]); // Debug log

    if (players[index]) {
      h4.textContent = 'Ready!';
      img.src = players[index].avatar || '../img/user-solid.svg';
      p.textContent = players[index].name || 'Unnamed';
    } else {
      h4.textContent = 'Unoccupied';
      img.src = '../img/user-solid.svg';
      p.textContent = 'Unnamed';
    }
  });
});
/*------------------------------------------------------------------------->
  Optional: Game State Alerts
<-------------------------------------------------------------------------*/

socket.on('game-started', () => {
  alert("✅ Game started!");
});

socket.on('lobby-cleared', () => {
  alert("❌ Lobby cleared.");
});
