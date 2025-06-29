// socket.js
const socketIo = require('socket.io');

const connectedUsers = new Map();

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('authenticate', (userId) => {
      if (userId) {
        connectedUsers.set(userId.toString(), socket.id);
        socket.join(`user_${userId}`);
        console.log(`User ${userId} connected with socket ${socket.id}`);
        io.emit('updateOnlineUsers', Array.from(connectedUsers.keys()));
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          io.emit('updateOnlineUsers', Array.from(connectedUsers.keys()));
          break;
        }
      }
    });
  });

  return io;
}

module.exports = initializeSocket;