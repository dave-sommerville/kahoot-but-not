'use strict';
const socket = io(); 

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

// Listen for the 'new-question' event from the server
socket.on('new-question', (question) => {
  console.log("🟢 New Question Received:", question);
  document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

  document.querySelector('.question-text').innerText = question.question_text;

  // document.querySelector('.opt-one-txt').innerText = question.option_a;
  // document.querySelector('.opt-two-txt').innerText = question.option_b;
  // document.querySelector('.opt-three-txt').innerText = question.option_c;
  // document.querySelector('.opt-four-txt').innerText = question.option_d;
  const mcqWrapper = document.querySelector('.multiple-choice-wrapper');
  const tfWrapper = document.querySelector('.true-false-wrapper');

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
  // document.getElementById('answer').value = '';
});

socket.on('answer-feedback', (data) => {
  if (!data.correct) {
    alert("Wrong answer! Try again.");
  }
});

// Handle answer submission when the player selects an option
// document.querySelector('.submit').addEventListener('click', () => {
//   const answer = document.getElementById('answer').value.trim();
//   if (!answer) {
//     alert("Enter an answer!");
//     return;
//   }
//   // Emit the answer to the server
//   socket.emit('submit-answer', { nickname, answer });
//   console.log("📤 Emitting answer:", answer);
// });


  // let answer = '';
  // if (document.querySelector('.true-false-wrapper').style.display === 'block') {
  //   // Get selected TF option
  //   const selected = document.querySelector('input[name="tf-option"]:checked');
  //   if (selected) {
  //     answer = selected.value;
  //   }
  // } else {
  //   // Get selected MCQ option
  //   const selected = document.querySelector('input[name="mcq-option"]:checked');
  //   if (selected) {
  //     answer = selected.value;
  //   }
  // }

  // if (!answer) {
  //   alert("Please select an answer!");
  //   return;
  // }

  // socket.emit('submit-answer', { nickname, answer });

let selectedAnswer = '';

document.querySelectorAll('.multiple-choice-wrapper div, .true-false-wrapper div').forEach(optionDiv => {
  optionDiv.addEventListener('click', () => {
    // Clear previous selection
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

    // Mark this one
    optionDiv.classList.add('selected');

    // Extract text from p tag
    selectedAnswer = optionDiv.querySelector('p').innerText.trim();
  });
});

document.querySelector('.submit').addEventListener('click', () => {
  // console.log("User Answer:", `"${userAnswer}"`);
  // console.log("Correct Answer:", `"${correctAnswer}"`);
  // console.log("Match?", userAnswer === correctAnswer);
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
