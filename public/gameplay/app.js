'use strict';
const socket = io();
let nickname = "";

// Handle player name selection
document.querySelector('.select-name').addEventListener('click', () => {
  nickname = document.getElementById('playerName').value.trim();

  if (!nickname) {
    alert("Please enter your name!");
    return;
  }

  socket.emit('player-join', nickname);
  console.log("🔵 Emitted 'player-join' with name:", nickname);

  // Optionally disable input/button here
  document.getElementById('playerName').disabled = true;
  document.querySelector('.select-name').disabled = true;
});

// Confirmation from server
socket.on('player-joined', (data) => {
  console.log(" Player joined:", data.name);
  // Navigate to quiz or show next section
});

// Receive a question from server
socket.on('new-question', (question) => {
  console.log(" New Question Received:", question);

  const questionArea = document.getElementById('questionArea');
  questionArea.innerText = question.question_text;
  // Display options if it's MCQ
});

// Handle answer submission
document.querySelector('.submit').addEventListener('click', () => {
  const answer = document.getElementById('answer').value.trim();
  if (!answer) {
    alert("Enter an answer!");
    return;
  }

  socket.emit('submit-answer', { nickname, answer });
  console.log(" Submitted answer:", answer);
});
