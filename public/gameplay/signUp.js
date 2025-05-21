'use strict';
function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const selectName = document.querySelector('.select-name');
const playerName = document.getElementById('playerName');

selectName.addEventListener('click', () => {
  const nickname = playerName.value.trim();
  if (!nickname) {
    alert("Please enter your name!");
    return;
  } 
  localStorage.setItem("nickname", nickname);
  window.location.href = "./index.html";
});