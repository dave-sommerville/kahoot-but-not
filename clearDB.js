const db = require('./server/db'); // or sqlite3 setup

// db.run(`CREATE TABLE IF NOT EXISTS players (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   name TEXT UNIQUE,
//   avatar TEXT,
//   score INTEGER DEFAULT 0,
//   correct_answer INTEGER DEFAULT 0
// );`, (err) => {
//   if (err) {
//     return console.error('Error clearing players table:', err.message);
//   }
//   console.log('All players deleted from the database.');
// });

// db.run('ALTER TABLE players ADD COLUMN avatar TEXT', (err) => {
//   if (err) {
//     return console.error('Error clearing players table:', err.message);
//   }
//   console.log('All players deleted from the database.');
// });

db.run('DELETE FROM players', (err) => {
  if (err) {
    return console.error('Error clearing players table:', err.message);
  }
  console.log('All players deleted from the database.');
});


