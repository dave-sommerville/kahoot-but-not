'use strict';
function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const socket = io(); 
const mcqWrapper = document.querySelector('.multiple-choice-wrapper');
const tfWrapper = document.querySelector('.true-false-wrapper');
const questiontxt =  document.querySelector('.question-text');
const allQuestype = document.querySelectorAll('.multiple-choice-wrapper div, .true-false-wrapper div');
const selectedElements = document.querySelectorAll('.selected');
const submitBtn = document.querySelector('.submit');

let nickname = localStorage.getItem('nickname') || "";

if (!nickname) {
  alert("Please sign up first to set your nickname!");
  window.location.href = "./signUp.html";
} else {
  console.log(" Nickname fetched from localStorage:", nickname);
  socket.emit('player-join', nickname); 
}

socket.on('new-question', (question) => {
  console.log("🟢 New Question Received:", question);
  selectedElements.forEach(el => el.classList.remove('selected', 'wrong', 'correct'));

  questiontxt.innerText = question.question_text;

  if (question.question_type === 'tf') {
    mcqWrapper.style.display = 'none';
    tfWrapper.style.display = 'block';
    document.querySelector('.opt-one-txt').innerText = question.option_a;
    document.querySelector('.opt-two-txt').innerText = question.option_b;
  } else {
    tfWrapper.style.display = 'none';
    mcqWrapper.style.display = 'block';
    document.querySelector('.opt-one-txt').innerText = question.option_a;
    document.querySelector('.opt-two-txt').innerText = question.option_b;
    document.querySelector('.opt-three-txt').innerText = question.option_c;
    document.querySelector('.opt-four-txt').innerText = question.option_d;
  }
});

socket.on('answer-feedback', (data) => {
  allQuestype.forEach(option => {
    option.classList.remove('correct', 'wrong', 'selected');
  });

  const userAnswer = data.userAnswer.toLowerCase();
  const correctAnswer = data.correctAnswer.toLowerCase();
  const isCorrect = userAnswer === correctAnswer;

  allQuestype.forEach(option => {
    const optionText = option.querySelector('p').innerText.trim().toLowerCase();

    if (optionText === correctAnswer) {
      option.classList.add('correct');
    }

    if (optionText === userAnswer && userAnswer !== correctAnswer) {
      option.classList.add('wrong');
    }
  });

  if (isCorrect) {
    socket.emit('next-question');
  } else {
    setTimeout(() => {
      socket.emit('next-question');
    }, 2000); 
  }
});

let selectedAnswer = '';

allQuestype.forEach(optionDiv => {
  optionDiv.addEventListener('click', () => {
    const newselected = document.querySelectorAll('.selected');
    newselected.forEach(el => {
      el.classList.remove('selected');
      el.classList.remove('wrong');
      el.classList.remove('correct');
    });
    optionDiv.classList.add('selected');
    selectedAnswer = optionDiv.querySelector('p').innerText.trim();
  });
});

submitBtn.addEventListener('click', () => {
  if (!selectedAnswer) {
    alert("Please select an answer!");
    return;
  }
  console.log(` Received answer from ${nickname}: ${selectedAnswer}`);
  socket.emit('submit-answer', { nickname, answer: selectedAnswer });
  console.log("User Answer:", `"${selectedAnswer}"`);
  console.log("Correct Answer:", `"${correctAnswer}"`);
  console.log("Match?", selectedAnswer === correctAnswer);
});
