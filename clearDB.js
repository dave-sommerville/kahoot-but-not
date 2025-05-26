const db = require('./db'); // or sqlite3 setup

db.run('DELETE FROM players', (err) => {
  if (err) {
    return console.error('Error clearing players table:', err.message);
  }
  console.log('All players deleted from the database.');
});

// db.run('ALTER TABLE players ADD COLUMN avatar TEXT', (err) => {
//   if (err) {
//     return console.error('Error clearing players table:', err.message);
//   }
//   console.log('All players deleted from the database.');
// });

