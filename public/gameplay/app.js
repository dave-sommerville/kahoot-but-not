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

let countdown = 60;
let countdownInterval = null;

// let countdown = 60;
const countdownEl = document.getElementById("countdown");

// const countdownInterval = setInterval(() => {
//   countdown--;
//   countdownEl.textContent = `⏳ Time left: ${countdown}s`;

//   if (countdown <= 0) {
//     clearInterval(countdownInterval);
//   }
// }, 1000);
function startCountdown(duration = 60) {
  clearInterval(countdownInterval);
  countdown = duration;
  countdownEl.textContent = `⏳ Time left: ${countdown}s`;

  countdownInterval = setInterval(() => {
    countdown--;
    countdownEl.textContent = `⏳ Time left: ${countdown}s`;

    if (countdown <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

socket.on("time-up", () => {
  //new
  clearInterval(countdownInterval);
  quesDisplay.style.display = 'none';
  StopMsg.style.display = 'block';
  StopMsg.innerText = "Time’s up! Thanks for playing.";
  setTimeout(() => {
      window.location.href = '../viewing/index.html';
  }, 5000);
});

if (!nickname) {
  alert("Please sign up first to set your nickname!");
  window.location.href = "./signUp.html";
} else {
  console.log("✅ Player authenticated:", nickname, avatar);
  socket.emit('player-join', { nickname, avatar });
}

  socket.on('gameStarted', () => {
    console.log('Game started!');
    submitBtn.disabled = false;
    submitBtn.style.backgroundColor = '#c2cfa4';
    pauseMsg.style.display = 'none';
    allQuestype.forEach(option => option.style.pointerEvents = 'auto');
  });

  socket.on('gamePaused', () => {
    console.log('⏸Game paused!');
    //new
    clearInterval(countdownInterval);
    submitBtn.disabled = true;
    pauseMsg.style.display = 'block';
    allQuestype.forEach(option => option.style.pointerEvents = 'none');
  });

  socket.on('gameStopped', () => {
    console.log('Game stopped!');
    clearInterval(countdownInterval);
    submitBtn.disabled = true;
    pauseMsg.style.display = 'none';
    quesDisplay.style.display = 'none';
    StopMsg.style.display = 'block';
    StopMsg.innerText = "Quiz Stopped! \nThank you for Playing;";
    allQuestype.forEach(option => option.style.pointerEvents = 'none');
    setTimeout(() => {
      window.location.href = '../viewing/index.html';
    }, 5000); 
  });


//  New question
socket.on('new-question', (question) => {
  console.log("🟢 New question:", question);
  selectedAnswer = '';
  timeLeft = question.time || 15;
  startTimer();

  allQuestype.forEach(el => el.classList.remove('selected', 'correct', 'wrong'));
  questiontxt.innerText = question.question_text;
  //new
  // startCountdown(60);
  let remaining = 60;
  if (question.startTime) {
    const elapsed = Math.floor((Date.now() - question.startTime) / 1000);
    remaining = Math.max(60 - elapsed, 0);
  }
  startCountdown(remaining);

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
    warningMsg.style.display = 'block';
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

