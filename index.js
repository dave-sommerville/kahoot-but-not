'use strict';
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./server/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Load global setup for quiz questions
const mainHandlers = require('./server/main');

// Setup database and quiz questions globally
mainHandlers.setup(io, db);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Cyber Clash 🎮</h1>
    <p>
      Go to 
      <a href="/gameplay/index.html">Gameplay</a>, 
      <a href="/admin/index.html">Admin</a>, or 
      <a href="/viewing/index.html">Viewing</a>
    </p>
  `);
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  // Admin logic first so it can be passed into main logic
  const adminLogic = require('./server/admin')(io, socket, db);

  //  Pass admin logic into main logic
  require('./server/main')(io, socket, db, adminLogic);

  //  Player-specific events
  require('./server/player')(io, socket, db);
});

server.listen(3000, () => {
  console.log(' Server running on http://localhost:3000');
});
