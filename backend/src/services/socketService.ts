import { Server, Socket } from 'socket.io';

interface UserPresence {
  socketId: string;
  userId: string;
  username: string;
  cursor?: { lineNumber: number; column: number };
}

interface RoomState {
  code: string;
  language: string;
  users: Map<string, UserPresence>; // socketId -> presence
}

const activeRooms = new Map<string, RoomState>();

export const initSocketService = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join collaborative room
    socket.on('room:join', ({ roomId, userId, username }: { roomId: string; userId: string; username: string }) => {
      socket.join(roomId);
      console.log(`User ${username} (${userId}) joined room ${roomId}`);

      // Initialize room state if empty
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          code: '// Start collaborating on CodeForge live session!\n',
          language: 'javascript',
          users: new Map()
        });
      }

      const room = activeRooms.get(roomId)!;
      room.users.set(socket.id, { socketId: socket.id, userId, username });

      // Send current state to the user who just joined
      socket.emit('room:sync-state', {
        code: room.code,
        language: room.language,
        users: Array.from(room.users.values())
      });

      // Broadcast user joined to other users
      socket.to(roomId).emit('room:user-joined', {
        socketId: socket.id,
        userId,
        username,
        users: Array.from(room.users.values())
      });
    });

    // Code changes
    socket.on('room:code-change', ({ roomId, code }: { roomId: string; code: string }) => {
      const room = activeRooms.get(roomId);
      if (room) {
        room.code = code;
        socket.to(roomId).emit('room:code-update', code);
      }
    });

    // Language changes
    socket.on('room:language-change', ({ roomId, language }: { roomId: string; language: string }) => {
      const room = activeRooms.get(roomId);
      if (room) {
        room.language = language;
        socket.to(roomId).emit('room:language-update', language);
      }
    });

    // Cursor tracking movements
    socket.on('room:cursor-move', ({ roomId, cursor }: { roomId: string; cursor: { lineNumber: number; column: number } }) => {
      const room = activeRooms.get(roomId);
      if (room) {
        const user = room.users.get(socket.id);
        if (user) {
          user.cursor = cursor;
          socket.to(roomId).emit('room:cursor-update', {
            socketId: socket.id,
            userId: user.userId,
            username: user.username,
            cursor
          });
        }
      }
    });

    // Explicit leave
    socket.on('room:leave', ({ roomId }: { roomId: string }) => {
      handleLeaveRoom(socket, roomId, io);
    });

    // Disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Find and remove user from any rooms they were in
      activeRooms.forEach((roomState, roomId) => {
        if (roomState.users.has(socket.id)) {
          handleLeaveRoom(socket, roomId, io);
        }
      });
    });
  });
};

const handleLeaveRoom = (socket: Socket, roomId: string, io: Server) => {
  const room = activeRooms.get(roomId);
  if (room) {
    const user = room.users.get(socket.id);
    if (user) {
      room.users.delete(socket.id);
      socket.leave(roomId);
      console.log(`User ${user.username} left room ${roomId}`);

      // If room is now empty, we can clean up
      if (room.users.size === 0) {
        activeRooms.delete(roomId);
      } else {
        // Broadcast user left
        io.to(roomId).emit('room:user-left', {
          socketId: socket.id,
          userId: user.userId,
          username: user.username,
          users: Array.from(room.users.values())
        });
      }
    }
  }
};
