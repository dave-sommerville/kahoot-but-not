'use strict';

// Get the DOM element for the 'select-name' button
document.querySelector('.select-name').addEventListener('click', () => {
  const nickname = document.getElementById('playerName').value.trim();

  if (!nickname) {
    alert("Please enter your name!");
    return;
  } 

  // Save nickname to localStorage
  localStorage.setItem("nickname", nickname);

  // Redirect to game page
  window.location.href = "./index.html";
});