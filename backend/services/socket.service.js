const { Server } = require('socket.io');
const config = require('../utils/config');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected ${socket.id}`);
    });
  });

  return io;
};

const emitLog = (payload) => {
  if (!io) {
    return;
  }

  io.emit('system-log', payload);
};

const getIo = () => io;

module.exports = {
  initSocket,
  emitLog,
  getIo
};
