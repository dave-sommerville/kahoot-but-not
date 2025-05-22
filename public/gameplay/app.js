'use strict';
const socket = io(); // default namespace

// Get nickname from localStorage
let nickname = localStorage.getItem('nickname') || "";

// If the nickname does not exist, redirect to sign-up page
if (!nickname) {
  alert("Please sign up first to set your nickname!");
  window.location.href = "./signUp.html";
} else {
  console.log(" Nickname fetched from localStorage:", nickname);
  socket.emit('player-join', nickname); // this was missing
}


// document.querySelector('#join-btn').addEventListener('click', () => {
//   const nickname = document.querySelector('#nickname').value;
//   if (!nickname) return;

//   // Emit player join with avatar
//   socket.emit('player-join', {
//     nickname,
//     avatar: profilePic
//   });
// });

// Listen for the 'new-question' event from the server
socket.on('new-question', (question) => {
  console.log("🟢 New Question Received:", question);

  document.querySelector('.question-text').innerText = question.question_text;
  document.querySelector('.opt-one-txt').innerText = question.option_a;
  document.querySelector('.opt-two-txt').innerText = question.option_b;
  document.querySelector('.opt-three-txt').innerText = question.option_c;
  document.querySelector('.opt-four-txt').innerText = question.option_d;
  document.getElementById('answer').value = '';
});

socket.on('answer-feedback', (data) => {
  if (!data.correct) {
    alert("Wrong answer! Try again.");
  }
});

// Handle answer submission when the player selects an option
document.querySelector('.submit').addEventListener('click', () => {
  const answer = document.getElementById('answer').value.trim();
  if (!answer) {
    alert("Enter an answer!");
    return;
  }
  // Emit the answer to the server
  socket.emit('submit-answer', { nickname, answer });
  console.log("📤 Submitted answer:", answer);
});

socket.on("answer-feedback", (data) => {
  if (data.correct) {
    alert("✅ Correct!");
  } else {
    alert(`❌ Incorrect! The correct answer is: ${data.correctAnswer}`);
  }
});

socket.on("answer-feedback", (data) => {
  if (data.correct) {
    alert("✅ Correct!");
  } else {
    alert(`❌ Incorrect! The correct answer is: ${data.correctAnswer}`);
  }
});
