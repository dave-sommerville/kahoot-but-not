// PURPOSE: SERVER - EXPRESS AND SOCKET.IO

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve static files
app.use(express.json());           // Enable JSON body parsing

// Add a player via REST API
app.post('/add-player', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO players(name) VALUES(?)', [name], function (err) {
    if (err) return res.status(500).send(err.message);
    res.json({ id: this.lastID });
  });
});

// Socket.IO for real-time messages
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('answer', (data) => {
    console.log(`${data.name} answered: ${data.answer}`);
    // Add scoring logic later
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
