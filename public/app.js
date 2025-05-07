'use strict'

const socket = io();
function submitAnswer() {
  const name = document.getElementById('playerName').value;
  const answer = document.getElementById('answer').value;
  socket.emit('answer', { name, answer });
}