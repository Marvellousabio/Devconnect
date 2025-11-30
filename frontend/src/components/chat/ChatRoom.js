import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send,
  MoreVert,
  Edit,
  Delete,
  Code,
  AttachFile,
} from '@mui/icons-material';
import { format } from 'date-fns';
import socketService from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

const GET_MESSAGES = gql`
  query GetMessages($roomId: ID!, $limit: Int, $offset: Int) {
    messages(roomId: $roomId, limit: $limit, offset: $offset) {
      id
      content
      sender {
        id
        username
        firstName
        lastName
        avatar
      }
      type
      metadata {
        language
        filename
        fileUrl
      }
      edited
      editedAt
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($roomId: ID!, $input: MessageInput!) {
    sendMessage(roomId: $roomId, input: $input) {
      id
      content
      sender {
        id
        username
        firstName
        lastName
        avatar
      }
      type
      metadata {
        language
        filename
        fileUrl
      }
      edited
      createdAt
    }
  }
`;

const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

const ChatRoom = ({ roomId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { loading, error, data, fetchMore } = useQuery(GET_MESSAGES, {
    variables: { roomId, limit: 50 },
    skip: !roomId,
    onCompleted: (data) => {
      setMessages(data.messages);
    }
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [deleteMessage] = useMutation(DELETE_MESSAGE);

  // Socket connection and message handling
  useEffect(() => {
    if (user && roomId) {
      socketService.connect(user.id);

      // Join the room
      socketService.socket.emit('join_room', roomId);

      // Listen for new messages
      const handleNewMessage = (message) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      };

      // Listen for message updates
      const handleMessageUpdate = (message) => {
        setMessages(prev => prev.map(m =>
          m.id === message.id ? { ...m, ...message, edited: true } : m
        ));
      };

      // Listen for typing indicators
      const handleUserTyping = (data) => {
        if (data.userId !== user.id) {
          setIsTyping(true);
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (data.userId !== user.id) {
          setIsTyping(false);
        }
      };

      socketService.onRoomMessage(roomId, handleNewMessage);
      socketService.onRoomMessage(roomId, handleMessageUpdate);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stopped_typing', handleUserStoppedTyping);

      return () => {
        socketService.offRoomMessage(roomId, handleNewMessage);
        socketService.offRoomMessage(roomId, handleMessageUpdate);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stopped_typing', handleUserStoppedTyping);
        socketService.socket.emit('leave_room', roomId);
      };
    }
  }, [user, roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const metadata = messageType === 'code' ? { language: 'javascript' } : undefined;

      await sendMessage({
        variables: {
          roomId,
          input: {
            content: newMessage.trim(),
            type: messageType,
            metadata
          }
        }
      });

      setNewMessage('');
      setMessageType('text');

      // Stop typing indicator
      socketService.stopTyping(roomId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Handle typing indicators
    if (!isTyping && e.target.value.trim()) {
      socketService.startTyping(roomId);
      setIsTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(roomId);
        setIsTyping(false);
      }, 3000);
    }
  };

  const handleMenuOpen = (event, message) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMessage(null);
  };

  const handleEditMessage = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setNewMessage(selectedMessage.content);
    }
    handleMenuClose();
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      await deleteMessage({
        variables: { messageId: selectedMessage.id }
      });

      // Remove the message from local state
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
    } catch (error) {
      console.error('Failed to delete message:', error);
      // TODO: Show error message to user
    }

    handleMenuClose();
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.sender.id === user?.id;
    const isEdited = message.edited;

    return (
      <ListItem
        key={message.id}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
          <ListItemAvatar sx={{ minWidth: 40 }}>
            <Avatar
              src={message.sender.avatar}
              sx={{ width: 32, height: 32 }}
            >
              {message.sender.firstName.charAt(0)}
            </Avatar>
          </ListItemAvatar>

          <Box sx={{ flex: 1, ml: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                {message.sender.firstName} {message.sender.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatMessageTime(message.createdAt)}
                {isEdited && ' (edited)'}
              </Typography>
            </Box>

            <Box sx={{ position: 'relative' }}>
              {message.type === 'code' ? (
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Code sx={{ mr: 1, fontSize: 16 }} />
                    <Chip
                      label={message.metadata?.language || 'code'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  {message.content}
                </Paper>
              ) : (
                <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
                  {message.content}
                </Typography>
              )}

              {isOwnMessage && (
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, message)}
                  sx={{ position: 'absolute', top: -8, right: -8 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>
      </ListItem>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading messages: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ width: '100%' }}>
          {messages.map((message) => renderMessage(message))}
          <div ref={messagesEndRef} />
        </List>

        {isTyping && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
            Someone is typing...
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Message Input */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
          />

          <Button
            variant="contained"
            endIcon={<Send />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Box>

      {/* Message Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditMessage}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteMessage}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChatRoom;