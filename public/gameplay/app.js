'use strict';

const socket = io();

// DOM Elements
const mcqWrapper = document.querySelector('.multiple-choice-wrapper');
const tfWrapper = document.querySelector('.true-false-wrapper');
const questiontxt = document.querySelector('.question-text');
const allQuestype = document.querySelectorAll('.multiple-choice-wrapper div, .true-false-wrapper div');
const submitBtn = document.querySelector('.submit');
const timerDisplay = document.querySelector('.timer');
const scoreDisplay = document.getElementById('playerScore');
const yippee = document.getElementById('yippeeMessage');

let nickname = localStorage.getItem('nickname');
let avatar = localStorage.getItem('avatar');
let selectedAnswer = '';
let timerInterval = null;
let timeLeft = 60;

// Enforce sign-up every time
if (!nickname || !avatar) {
  // Clear any partial data just in case
  localStorage.removeItem('nickname');
  localStorage.removeItem('avatar');
  alert("Please sign up first!");
  window.location.href = "./signUp.html";
} else {
  console.log("✅ Player authenticated:", nickname, avatar);
  socket.emit('player-join', { nickname, avatar });
}

// Timer
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      socket.emit('submit-answer', { nickname, answer: selectedAnswer || '' });
    }
  }, 1000);
}

// Highlight answer feedback
function highlightOptions(correctAnswer, userAnswer) {
  allQuestype.forEach(option => {
    const text = option.querySelector('p')?.innerText.trim().toLowerCase() || '';
    option.classList.remove('selected', 'correct', 'wrong');
    if (text === correctAnswer) option.classList.add('correct');
    if (text === userAnswer && userAnswer !== correctAnswer) option.classList.add('wrong');
  });
}

//  New question
socket.on('new-question', (question) => {
  console.log("🟢 New question:", question);
  selectedAnswer = '';
  timeLeft = question.time || 15;
  startTimer();

  allQuestype.forEach(el => el.classList.remove('selected', 'correct', 'wrong'));
  questiontxt.innerText = question.question_text;

  if (question.question_type === 'tf') {
    mcqWrapper.style.display = 'none';
    tfWrapper.style.display = 'grid';
    tfWrapper.querySelectorAll('p')[0].innerText = question.option_a;
    tfWrapper.querySelectorAll('p')[1].innerText = question.option_b;
  } else {
    tfWrapper.style.display = 'none';
    mcqWrapper.style.display = 'grid';
    const options = mcqWrapper.querySelectorAll('p');
    options[0].innerText = question.option_a;
    options[1].innerText = question.option_b;
    options[2].innerText = question.option_c;
    options[3].innerText = question.option_d;
  }
});

//  Feedback after answer
socket.on('answer-feedback', ({ correct, correctAnswer, userAnswer, score }) => {
  clearInterval(timerInterval);
  alert(correct
    ? `🎉 Correct! Your score: ${score}`
    : `❌ Wrong. You answered "${userAnswer}", correct was "${correctAnswer}". Your score: ${score}`
  );

  let newScore = Math.round((timeLeft / 15 ) * 200); 
  highlightOptions(correctAnswer, userAnswer);

  // Update score display
  if (scoreDisplay) {
    let currentScore = parseInt(scoreDisplay.innerText, 10) || 0; // Convert innerText to number, default to 0 if empty
    scoreDisplay.innerText = currentScore + newScore; // Perform proper addition
  }

  // If correct, show the "Yippee" message
  if (correct) {
    yippee.style.display = 'block';
    setTimeout(() => yippee.style.display = 'none', 1500);
  }

  // Ask for next quesiton after a few seconds
  setTimeout(() => {
    socket.emit('next-question');
  }, 4000);
});

// Option click
allQuestype.forEach(el => {
  el.addEventListener('click', () => {
    allQuestype.forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    const text = el.querySelector('p');
    selectedAnswer = text ? text.innerText.trim() : el.innerText.trim();
    console.log(`Selected: ${selectedAnswer}`);
  });
});

//  Submit click
submitBtn.addEventListener('click', () => {
  if (!selectedAnswer) {
    alert("Please select an answer!");
    return;
  }
  clearInterval(timerInterval);
  console.log(`Submitting: ${selectedAnswer}`);
  socket.emit('submit-answer', { nickname, answer: selectedAnswer });
});

// Optional: Clear data after window close to force re-signup next time
window.addEventListener('beforeunload', () => {
  localStorage.removeItem('nickname');
  localStorage.removeItem('avatar');
});

socket.on('quiz-complete', () => {
  console.log(" Quiz Complete");

  document.body.innerHTML = '';
  document.body.style.backgroundColor = 'white';

  //  Show a Game Over screen
  document.querySelector('.game-area').innerHTML = `
    <div class="game-over-screen">
      <h1> Quiz Complete!</h1>
      <p>Thanks for playing.</p>
      <button onclick="location.reload()">Play Again</button>
    </div>
  `;

});


socket.on('reset-client', () => {
  console.log(" Resetting client");

  //  Reload the page and reset local storage
  location.reload();

  localStorage.removeItem('nickname');
  localStorage.removeItem('avatar');
  alert("Please sign up again to play!");
  location.href = "./signUp.html";
});

