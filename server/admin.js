module.exports = (io, socket, db) => {
  const lobbyPlayers = {}; // { socketId: { name, avatar } }
  const finalPlayers = [];

  function registerPlayer(socket, player) {
    if (Object.keys(lobbyPlayers).length < 3) {
      lobbyPlayers[socket.id] = {
        name: player.nickname, // assuming the object contains 'nickname'
        avatar: player.avatar || '../img/user-solid.svg'
      };

      // Update all admin clients
      io.emit('lobby-update', getLobbyPlayers());
      return true;
    }
    return false;
  }

  function getLobbyPlayers() {
    return Object.values(lobbyPlayers);
  }

  function clearLobby() {
    for (const player of Object.values(lobbyPlayers)) {
      finalPlayers.push(player);
    }
    for (const key in lobbyPlayers) delete lobbyPlayers[key];
  }

  function handleAdminCommand(io, cmd) {
    if (cmd.type === 'start-game') {
      io.emit('game-started');
      io.emit('lobby-update', getLobbyPlayers());
    } else if (cmd.type === 'cancel-game') {
      clearLobby();
      io.emit('lobby-cleared');
      io.emit('lobby-update', getLobbyPlayers());
    }
  }

  return {
    registerPlayer,
    getLobbyPlayers,
    clearLobby,
    handleAdminCommand
  };
};
