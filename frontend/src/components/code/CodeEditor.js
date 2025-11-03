import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { io } from 'socket.io-client';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  PlayArrow,
  Save,
  Share,
  MoreVert,
  Code,
  People,
  AccessTime,
} from '@mui/icons-material';
import { format } from 'date-fns';
import socketService from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

const GET_CODE_SESSION = gql`
  query GetCodeSession($id: ID!) {
    codeSession(id: $id) {
      id
      name
      description
      language
      content
      participants {
        user {
          id
          username
          firstName
          lastName
          avatar
        }
        joinedAt
        lastActivity
        cursor {
          line
          column
        }
      }
      creator {
        id
        username
        firstName
        lastName
        avatar
      }
      isActive
      lastActivity
    }
  }
`;

const UPDATE_CODE_CONTENT = gql`
  mutation UpdateCodeContent($sessionId: ID!, $input: CodeChangeInput!) {
    updateCodeContent(sessionId: $sessionId, input: $input) {
      id
      changes {
        type
        position
        text
        length
      }
    }
  }
`;

const UPDATE_CURSOR_POSITION = gql`
  mutation UpdateCursorPosition($sessionId: ID!, $input: CursorUpdateInput!) {
    updateCursorPosition(sessionId: $sessionId, input: $input)
  }
`;

const CodeEditor = ({ sessionId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);
  const socketRef = useRef(null);

  const { loading, error, data, refetch } = useQuery(GET_CODE_SESSION, {
    variables: { sessionId },
    skip: !sessionId,
    onCompleted: (data) => {
      if (data?.codeSession) {
        setContent(data.codeSession.content);
        setParticipants(data.codeSession.participants);
      }
    }
  });

  const [updateCodeContent] = useMutation(UPDATE_CODE_CONTENT);
  const [updateCursorPosition] = useMutation(UPDATE_CURSOR_POSITION);

  // Initialize socket connection for real-time collaboration
  useEffect(() => {
    if (user && sessionId) {
      socketService.connect(user.id);

      // Join code session room
      socketService.socket.emit('join_code_session', sessionId);
      setIsConnected(true);

      // Listen for code changes from other users
      const handleCodeChange = (change) => {
        if (change.userId !== user.id) {
          applyRemoteChange(change);
        }
      };

      // Listen for cursor updates
      const handleCursorUpdate = (data) => {
        if (data.userId !== user.id) {
          updateParticipantCursor(data.userId, data.cursor);
        }
      };

      // Listen for participant updates
      const handleParticipantJoined = (participant) => {
        setParticipants(prev => [...prev, participant]);
      };

      const handleParticipantLeft = (participant) => {
        setParticipants(prev => prev.filter(p => p.user.id !== participant.user.id));
      };

      socketService.on('code_change', handleCodeChange);
      socketService.on('cursor_update', handleCursorUpdate);
      socketService.on('participant_joined', handleParticipantJoined);
      socketService.on('participant_left', handleParticipantLeft);

      return () => {
        socketService.off('code_change', handleCodeChange);
        socketService.off('cursor_update', handleCursorUpdate);
        socketService.off('participant_joined', handleParticipantJoined);
        socketService.off('participant_left', handleParticipantLeft);
        socketService.socket.emit('leave_code_session', sessionId);
      };
    }
  }, [user, sessionId]);

  // Handle local code changes
  const handleCodeChange = async (newContent) => {
    const oldContent = content;
    const changes = calculateChanges(oldContent, newContent);

    if (changes.length > 0) {
      try {
        await updateCodeContent({
          variables: {
            sessionId,
            input: { changes }
          }
        });

        // Broadcast change to other users
        socketService.socket.emit('code_change', {
          sessionId,
          userId: user.id,
          changes
        });

        setContent(newContent);
      } catch (error) {
        console.error('Failed to update code:', error);
      }
    }
  };

  // Handle cursor position changes
  const handleCursorChange = async (line, column) => {
    setCursorPosition({ line, column });

    try {
      await updateCursorPosition({
        variables: {
          sessionId,
          input: { line, column }
        }
      });

      // Broadcast cursor position
      socketService.socket.emit('cursor_update', {
        sessionId,
        userId: user.id,
        cursor: { line, column }
      });
    } catch (error) {
      console.error('Failed to update cursor:', error);
    }
  };

  // Apply remote changes from other users
  const applyRemoteChange = (change) => {
    let newContent = content;

    change.changes.forEach(changeItem => {
      const { type, position, text = '', length = 0 } = changeItem;

      switch (type) {
        case 'INSERT':
          newContent = newContent.slice(0, position) + text + newContent.slice(position);
          break;
        case 'DELETE':
          newContent = newContent.slice(0, position) + newContent.slice(position + length);
          break;
        case 'REPLACE':
          newContent = newContent.slice(0, position) + text + newContent.slice(position + length);
          break;
      }
    });

    setContent(newContent);
  };

  // Update participant cursor position
  const updateParticipantCursor = (userId, cursor) => {
    setParticipants(prev => prev.map(p =>
      p.user.id === userId
        ? { ...p, cursor }
        : p
    ));
  };

  // Calculate text changes between old and new content
  const calculateChanges = (oldContent, newContent) => {
    const changes = [];
    const maxLength = Math.max(oldContent.length, newContent.length);

    let i = 0;
    while (i < maxLength) {
      if (oldContent[i] !== newContent[i]) {
        // Find the extent of the difference
        let j = i;
        while (j < maxLength && oldContent[j] !== newContent[j]) {
          j++;
        }

        const oldSubstring = oldContent.slice(i, j);
        const newSubstring = newContent.slice(i, j);

        if (oldSubstring.length === 0 && newSubstring.length > 0) {
          // Insert
          changes.push({
            type: 'INSERT',
            position: i,
            text: newSubstring
          });
        } else if (oldSubstring.length > 0 && newSubstring.length === 0) {
          // Delete
          changes.push({
            type: 'DELETE',
            position: i,
            length: oldSubstring.length
          });
        } else {
          // Replace
          changes.push({
            type: 'REPLACE',
            position: i,
            text: newSubstring,
            length: oldSubstring.length
          });
        }

        i = j;
      } else {
        i++;
      }
    }

    return changes;
  };

  // Handle running code (simplified - would need backend execution)
  const handleRunCode = async () => {
    setIsRunning(true);
    setRunDialogOpen(true);

    try {
      // This would typically call a backend service to execute the code
      // For now, just simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      let output = '';
      const language = data?.codeSession?.language;

      switch (language) {
        case 'javascript':
          try {
            // Very basic JS execution simulation
            output = 'Code executed successfully!\nOutput: Hello, World!';
          } catch (error) {
            output = `Error: ${error.message}`;
          }
          break;
        case 'python':
          output = 'Python execution not implemented in demo';
          break;
        default:
          output = `Execution not supported for ${language}`;
      }

      setRunOutput(output);
    } catch (error) {
      setRunOutput('Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      java: '#007396',
      cpp: '#00599c',
      c: '#a8b9cc',
      go: '#00add8',
      rust: '#000000',
      php: '#777bb4',
      ruby: '#cc342d',
      html: '#e34f26',
      css: '#1572b6',
      sql: '#336791',
      json: '#000000',
      xml: '#000000',
      yaml: '#000000',
      markdown: '#083fa1',
      bash: '#4eaa25',
      powershell: '#012456'
    };
    return colors[language] || '#666';
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
        Error loading code session: {error.message}
      </Alert>
    );
  }

  const session = data?.codeSession;

  if (!session) {
    return (
      <Alert severity="error">
        Code session not found
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Code sx={{ fontSize: 28, color: getLanguageColor(session.language) }} />
            <Box>
              <Typography variant="h6">{session.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {session.description}
              </Typography>
            </Box>
            <Chip
              label={session.language}
              size="small"
              sx={{
                backgroundColor: getLanguageColor(session.language),
                color: 'white'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Participants */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People sx={{ fontSize: 20, color: 'text.secondary' }} />
              {participants.slice(0, 3).map((participant) => (
                <Avatar
                  key={participant.user.id}
                  src={participant.user.avatar}
                  sx={{ width: 32, height: 32 }}
                  title={participant.user.firstName}
                >
                  {participant.user.firstName.charAt(0)}
                </Avatar>
              ))}
              {participants.length > 3 && (
                <Typography variant="body2" color="text.secondary">
                  +{participants.length - 3}
                </Typography>
              )}
            </Box>

            {/* Connection Status */}
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              size="small"
              color={isConnected ? 'success' : 'error'}
            />

            {/* Menu */}
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Code Editor */}
      <Paper sx={{ flex: 1, p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Save />}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
            >
              Share
            </Button>
          </Box>
        </Box>

        <Box sx={{ flex: 1, p: 2 }}>
          <TextField
            fullWidth
            multiline
            variant="outlined"
            value={content}
            onChange={(e) => {
              const newContent = e.target.value;
              handleCodeChange(newContent);
            }}
            onSelect={(e) => {
              const textarea = e.target;
              const start = textarea.selectionStart;
              const text = textarea.value;
              const lines = text.substring(0, start).split('\n');
              const line = lines.length - 1;
              const column = lines[lines.length - 1].length;
              handleCursorChange(line, column);
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: 1.5,
              }
            }}
            placeholder="Start coding..."
          />
        </Box>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <Code sx={{ mr: 1 }} />
          Change Language
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <People sx={{ mr: 1 }} />
          Manage Participants
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <AccessTime sx={{ mr: 1 }} />
          View History
        </MenuItem>
      </Menu>

      {/* Run Code Dialog */}
      <Dialog
        open={runDialogOpen}
        onClose={() => setRunDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Code Execution Result
          {isRunning && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={runOutput}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CodeEditor;