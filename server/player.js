module.exports = (io, socket, db) => {
    const playerStates = {}; // Module-wide shared

  socket.on('player-join', ({ nickname, avatar }) => {
  db.run(`
    INSERT OR IGNORE INTO players (name, avatar) VALUES (?, ?)
  `, [nickname, avatar], (err) => {
    if (err) {
      console.error('Error inserting player:', err.message);
      socket.emit('player-error', 'Database error');
      return;
    }

    // Fetch the full player object after insert
    db.get(`SELECT * FROM players WHERE name = ?`, [nickname], (err, row) => {
      if (err) {
        console.error('Error fetching player:', err.message);
        socket.emit('player-error', 'Database fetch error');
        return;
      }

      // Send the full player object back
      socket.emit('player-joined', row);
    });
  });
    });

    socket.on('get-leaderboard', () => {
      db.all(`
        SELECT name, avatar, score 
        FROM players 
        ORDER BY score DESC 
        LIMIT 10
      `, (err, rows) => {
    if (err) {
      socket.emit('leaderboard-error', err.message);
      return;
    }
    socket.emit('leaderboard-data', rows);
  });
});


};