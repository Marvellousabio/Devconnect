import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Map();
    this.roomMessageHandlers = new Map();
  }

  connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URI || 'http://localhost:4000';

    this.socket = io(serverUrl, {
      auth: {
        userId
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');

      // Rejoin user room
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up global message handlers
    this.setupGlobalHandlers();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupGlobalHandlers() {
    // Handle new messages
    this.socket.on('new_message', (message) => {
      const handlers = this.roomMessageHandlers.get(message.room);
      if (handlers) {
        handlers.forEach(handler => handler(message));
      }
    });

    // Handle message updates
    this.socket.on('message_updated', (message) => {
      const handlers = this.roomMessageHandlers.get(message.room);
      if (handlers) {
        handlers.forEach(handler => handler(message, 'updated'));
      }
    });

    // Handle typing indicators
    this.socket.on('user_typing', (data) => {
      const handlers = this.roomMessageHandlers.get(data.roomId);
      if (handlers) {
        handlers.forEach(handler => handler(data, 'typing_start'));
      }
    });

    this.socket.on('user_stopped_typing', (data) => {
      const handlers = this.roomMessageHandlers.get(data.roomId);
      if (handlers) {
        handlers.forEach(handler => handler(data, 'typing_stop'));
      }
    });

    // Handle notifications
    this.socket.on('notification', (notification) => {
      // Emit custom event for notification system
      window.dispatchEvent(new CustomEvent('socket-notification', { detail: notification }));
    });

    // Handle errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Room management
  joinRoom(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', roomId);
      this.roomMessageHandlers.delete(roomId);
    }
  }

  // Message handling
  sendMessage(roomId, content, type = 'text', metadata = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        roomId,
        content,
        type,
        metadata
      });
    }
  }

  editMessage(messageId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('edit_message', {
        messageId,
        content
      });
    }
  }

  // Typing indicators
  startTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', roomId);
    }
  }

  stopTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', roomId);
    }
  }

  // Event subscription for specific rooms
  onRoomMessage(roomId, handler) {
    if (!this.roomMessageHandlers.has(roomId)) {
      this.roomMessageHandlers.set(roomId, new Set());
    }
    this.roomMessageHandlers.get(roomId).add(handler);
  }

  offRoomMessage(roomId, handler) {
    const handlers = this.roomMessageHandlers.get(roomId);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.roomMessageHandlers.delete(roomId);
      }
    }
  }

  // General event subscription
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event).add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event, handler) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(event);
        if (this.socket) {
          this.socket.off(event, handler);
        }
      }
    }
  }

  // Utility methods
  get isConnected() {
    return this.socket?.connected || false;
  }

  get socketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;