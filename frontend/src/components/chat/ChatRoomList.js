import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add,
  Chat,
  Group,
  Person,
  Message,
} from '@mui/icons-material';
import { format } from 'date-fns';

const GET_CHAT_ROOMS = gql`
  query GetChatRooms($projectId: ID) {
    chatRooms(projectId: $projectId) {
      id
      name
      description
      type
      participants {
        id
        username
        firstName
        lastName
        avatar
      }
      lastMessage {
        content
        sender {
          username
        }
        timestamp
      }
      participantCount
    }
  }
`;

const CREATE_CHAT_ROOM = gql`
  mutation CreateChatRoom($projectId: ID!, $input: ChatRoomInput!) {
    createChatRoom(projectId: $projectId, input: $input) {
      id
      name
      type
    }
  }
`;

const ChatRoomList = ({ projectId, onRoomSelect, selectedRoomId }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    type: 'group',
  });

  const { loading, error, data, refetch } = useQuery(GET_CHAT_ROOMS, {
    variables: { projectId },
    skip: !projectId,
  });

  const [createChatRoom] = useMutation(CREATE_CHAT_ROOM);

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim()) return;

    try {
      await createChatRoom({
        variables: {
          projectId,
          input: {
            name: newRoom.name.trim(),
            description: newRoom.description.trim(),
            type: newRoom.type,
            participantIds: [], // Add current user and maybe others
          }
        }
      });

      setCreateDialogOpen(false);
      setNewRoom({ name: '', description: '', type: 'group' });
      refetch();
    } catch (error) {
      console.error('Failed to create chat room:', error);
    }
  };

  const getRoomIcon = (type) => {
    switch (type) {
      case 'direct':
        return <Person />;
      case 'group':
        return <Group />;
      case 'project':
        return <Chat />;
      default:
        return <Chat />;
    }
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'direct':
        return 'primary';
      case 'group':
        return 'secondary';
      case 'project':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (!content) return '';
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading chat rooms: {error.message}
      </Alert>
    );
  }

  const rooms = data?.chatRooms || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2 }}>
        <Typography variant="h6">
          Chat Rooms ({rooms.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          size="small"
        >
          New Room
        </Button>
      </Box>

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Message sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No chat rooms yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first chat room to start communicating with your team.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Chat Room
          </Button>
        </Box>
      ) : (
        <List sx={{ width: '100%' }}>
          {rooms.map((room) => (
            <ListItem
              key={room.id}
              button
              selected={selectedRoomId === room.id}
              onClick={() => onRoomSelect(room.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getRoomIcon(room.type)}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      {room.name}
                    </Typography>
                    <Chip
                      label={room.type}
                      size="small"
                      color={getRoomTypeColor(room.type)}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {room.lastMessage ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>{room.lastMessage.sender.username}:</strong> {truncateMessage(room.lastMessage.content)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        No messages yet
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {room.participantCount} member{room.participantCount !== 1 ? 's' : ''}
                      </Typography>
                      {room.lastMessage && (
                        <Typography variant="caption" color="text.secondary">
                          {formatLastMessageTime(room.lastMessage.timestamp)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Create Room Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Chat Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            variant="outlined"
            value={newRoom.name}
            onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newRoom.description}
            onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Room Type"
            value={newRoom.type}
            onChange={(e) => setNewRoom(prev => ({ ...prev, type: e.target.value }))}
          >
            <MenuItem value="group">Group Chat</MenuItem>
            <MenuItem value="project">Project Chat</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained">
            Create Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatRoomList;