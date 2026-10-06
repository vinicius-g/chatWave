/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

const { createServer } = require('node:http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.DOMAIN || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = `http://${hostname}:${port}`;
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const broadcastOnlineUsers = () => {
    const users = Array.from(onlineUsers.values());
    io.emit('online-users', users);
  };

  io.on('connection', (socket) => {
    const { userId, name, email, role } = socket.handshake.auth || {};
    const isIdentifiedUser = typeof userId === 'string' && typeof name === 'string';
    const isAdmin = role === 'ADMIN';

    if (isIdentifiedUser) {
      onlineUsers.set(userId, { id: userId, name, email, role, socketId: socket.id });
      broadcastOnlineUsers();
    } else {
      socket.disconnect(true);
      return;
    }

    socket.on('send-message', (message) => {
      if (message?.user?.id !== userId) return;
      io.emit('new-message', message);
    });

    socket.on('ban-user', (userIdToBan) => {
      if (!isAdmin || typeof userIdToBan !== 'string') return;

      io.emit('user-banned', userIdToBan);
      const bannedUser = onlineUsers.get(userIdToBan);
      if (bannedUser?.socketId) {
        io.sockets.sockets.get(bannedUser.socketId)?.disconnect(true);
      }
      onlineUsers.delete(userIdToBan);
      broadcastOnlineUsers();
    });

    socket.on('disconnect', () => {
      const registeredUser = onlineUsers.get(userId);
      if (registeredUser?.socketId === socket.id) {
        onlineUsers.delete(userId);
        broadcastOnlineUsers();
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
