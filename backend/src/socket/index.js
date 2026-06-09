const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const onlineUsers = new Map();

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    console.log(`🟢 User ${userId} connected`);

    io.emit('users:online', Array.from(onlineUsers.keys()));
    socket.broadcast.emit('user:online', { user_id: userId });

    // Join project rooms
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });
    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Task events
    socket.on('task:create', (data) => {
      socket.to(`project:${data.project_id}`).emit('task:created', data);
    });
    socket.on('task:update', (data) => {
      socket.to(`project:${data.project_id}`).emit('task:updated', data);
    });
    socket.on('task:delete', (data) => {
      socket.to(`project:${data.project_id}`).emit('task:deleted', data);
    });

    // Comment events
    socket.on('comment:new', (data) => {
      socket.to(`project:${data.project_id}`).emit('comment:created', data);
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      socket.to(`project:${data.project_id}`).emit('user:typing', { user_id: userId, ...data });
    });
    socket.on('typing:stop', (data) => {
      socket.to(`project:${data.project_id}`).emit('user:stop-typing', { user_id: userId });
    });

    // Cursor
    socket.on('cursor:move', (data) => {
      socket.to(`project:${data.project_id}`).emit('cursor:moved', { user_id: userId, ...data });
    });

    // ====== CHAT ======
    socket.on('chat:join', (roomId) => {
      socket.join(`chat:${roomId}`);
    });
    socket.on('chat:leave', (roomId) => {
      socket.leave(`chat:${roomId}`);
    });
    socket.on('chat:message', async (data) => {
      const { roomId, content } = data;
      if (!content?.trim()) return;
      try {
        const [result] = await pool.query(
          'INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)',
          [roomId, userId, content.trim()]
        );
        const [rows] = await pool.query(
          `SELECT m.id, m.room_id, m.content, m.created_at,
                  u.id as user_id, u.name, u.avatar
           FROM messages m JOIN users u ON m.user_id = u.id
           WHERE m.id = ?`,
          [result.insertId]
        );
        io.to(`chat:${roomId}`).emit('chat:message', rows[0]);
      } catch (err) {
        console.error('Chat error:', err);
      }
    });
    socket.on('chat:typing', ({ roomId }) => {
      socket.to(`chat:${roomId}`).emit('chat:typing', { userId });
    });
    socket.on('chat:stop-typing', ({ roomId }) => {
      socket.to(`chat:${roomId}`).emit('chat:stop-typing', { userId });
    });
    // ====== END CHAT ======

    // ====== WebRTC CALLS ======
    socket.on('call:join', ({ roomId }) => {
      socket.join(`call:${roomId}`);
      socket.to(`call:${roomId}`).emit('call:user-joined', { userId });
    });
    socket.on('call:leave', ({ roomId }) => {
      socket.leave(`call:${roomId}`);
      socket.to(`call:${roomId}`).emit('call:user-left', { userId });
    });
    socket.on('call:offer', ({ roomId, offer, toUserId }) => {
      socket.to(`call:${roomId}`).emit('call:offer', { offer, fromUserId: userId });
    });
    socket.on('call:answer', ({ roomId, answer, toUserId }) => {
      socket.to(`call:${roomId}`).emit('call:answer', { answer, fromUserId: userId });
    });
    socket.on('call:ice-candidate', ({ roomId, candidate }) => {
      socket.to(`call:${roomId}`).emit('call:ice-candidate', { candidate, fromUserId: userId });
    });
    socket.on('call:toggle-audio', ({ roomId, enabled }) => {
      socket.to(`call:${roomId}`).emit('call:audio-toggled', { userId, enabled });
    });
    socket.on('call:toggle-video', ({ roomId, enabled }) => {
      socket.to(`call:${roomId}`).emit('call:video-toggled', { userId, enabled });
    });
    // ====== END WebRTC CALLS ======

    // ====== WHITEBOARD ======
    socket.on('whiteboard:draw', (data) => {
      socket.to(`project:${data.projectId}`).emit('whiteboard:draw', { ...data, userId });
    });
    socket.on('whiteboard:clear', (data) => {
      socket.to(`project:${data.projectId}`).emit('whiteboard:clear', { userId });
    });
    socket.on('whiteboard:sticky-add', (data) => {
      socket.to(`project:${data.projectId}`).emit('whiteboard:sticky-add', { ...data, userId });
    });
    socket.on('whiteboard:sticky-move', (data) => {
      socket.to(`project:${data.projectId}`).emit('whiteboard:sticky-move', { ...data, userId });
    });
    socket.on('whiteboard:sticky-delete', (data) => {
      socket.to(`project:${data.projectId}`).emit('whiteboard:sticky-delete', { ...data, userId });
    });
    // ====== END WHITEBOARD ======

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { user_id: userId });
      console.log(`🔴 User ${userId} disconnected`);
    });
  }); // ← end of io.on('connection')

  const sendNotification = (userId, notification) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification:new', notification);
    }
  };

  return { sendNotification, onlineUsers };
}; // ← end of module.exports