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

let profilePic = "";
let imageIndex = 0;
const avatar = select(".avatar");
const rightArrow = select(".right-arrow");
const leftArrow = select(".left-arrow");

const imageFiles = ["../img/ded.png", "../img/devil.png", "../img/happy.png", "../img/star.png", "../img/think.png", "../img/wink.png", "../img/worry.png"];
avatar.src = imageFiles[imageIndex];
listen("click", rightArrow,() => {
  imageIndex++;
  console.log("imageIndex");
  if (imageIndex === 6) {
    imageIndex = 0;
  }
  profilePic = imageFiles[imageIndex];
  avatar.src = profilePic;
});

listen("click", leftArrow,() => {
  imageIndex--;
  if (imageIndex === 0) {
    imageIndex = 6;
  }
  profilePic = imageFiles[imageIndex];
  avatar.src = profilePic;
});