import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatRoom from '../components/chat/ChatRoom';

const Chat = () => {
  const { projectId } = useParams();
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>
        Team Chat
      </Typography>

      <Paper sx={{ height: '100%', display: 'flex' }}>
        {/* Chat Room List Sidebar */}
        <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <ChatRoomList
            projectId={projectId}
            onRoomSelect={handleRoomSelect}
            selectedRoomId={selectedRoomId}
          />
        </Box>

        {/* Chat Room Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} />
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'text.secondary'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Select a chat room
              </Typography>
              <Typography variant="body2">
                Choose a room from the sidebar to start chatting
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;