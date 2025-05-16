function updateLeaderboardUI(data) {
  const highScoresList = document.querySelector('.high-scores');
  highScoresList.innerHTML = ""; // Clear the list first

  data.forEach((player, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${player.name} - ${player.score}`;
    highScoresList.appendChild(li);
  });

  // Optional: Populate fixed slots too
  const fixedSlots = document.querySelectorAll('.current-scores > div');
  fixedSlots.forEach((slot, i) => {
    if (data[i]) {
      slot.querySelector('h4').textContent = data[i].name;
      slot.querySelector('p').textContent = `Score: ${data[i].score}`;
    } else {
      slot.querySelector('h4').textContent = "";
      slot.querySelector('p').textContent = "";
    }
  });
}
