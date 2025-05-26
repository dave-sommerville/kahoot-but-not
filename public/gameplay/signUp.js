'use strict';

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const selectName = document.querySelector('.select-name');
const playerName = document.getElementById('playerName');
const avatar = select(".avatar");
const rightArrow = select(".right-arrow");
const leftArrow = select(".left-arrow");

const imageFiles = [
  "../img/ded.png",
  "../img/devil.png",
  "../img/happy.png",
  "../img/star.png",
  "../img/think.png",
  "../img/wink.png",
  "../img/worry.png"
];

let imageIndex = 0;
let profilePic = imageFiles[imageIndex];
avatar.src = profilePic;

// 🔄 Arrow navigation
listen("click", rightArrow, () => {
  imageIndex = (imageIndex + 1) % imageFiles.length;
  profilePic = imageFiles[imageIndex];
  avatar.src = profilePic;
});

listen("click", leftArrow, () => {
  imageIndex = (imageIndex - 1 + imageFiles.length) % imageFiles.length;
  profilePic = imageFiles[imageIndex];
  avatar.src = profilePic;
});

// ✅ Finalize sign-up
selectName.addEventListener('click', () => {
  const nickname = playerName.value.trim();

  if (!nickname) {
    alert("Please enter your name!");
    return;
  }

  // Save to localStorage
  localStorage.setItem('nickname', nickname);
  localStorage.setItem('avatar', profilePic);

  // Go to gameplay
  window.location.href = "./index.html"; 
});
