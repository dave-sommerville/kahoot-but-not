'use strict'
'use strict';

/*------------------------------------------------------------------------->
  Utility Functions 
<-------------------------------------------------------------------------*/

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function isImageFile(file) {
  return file && file.type.startsWith('image');
}


const socket = io();
const button = select('.submit');

function submitAnswer() {
  const name = document.getElementById('playerName').value;
  const answer = document.getElementById('answer').value;
  socket.emit('answer', { name, answer });
}

listen("click", button, () => {
  submitAnswer();
});