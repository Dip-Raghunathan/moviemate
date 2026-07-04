const socketIO = require('socket.io');
let io = null;

module.exports = {
  init: (httpServer) => {
    io = socketIO(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      socket.on('join_room', (roomId) => {
        socket.join(roomId);
      });

      socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
      });

      socket.on('join_user_notifications', (userId) => {
        socket.join(`user_${userId}`);
      });

      socket.on('disconnect', () => {
      });
    });

    return io;
  },
  getIO: () => {
    return io;
  },
};
