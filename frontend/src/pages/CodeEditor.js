import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  Add,
  Code,
} from '@mui/icons-material';
import CodeEditor from '../components/code/CodeEditor';

const CREATE_CODE_SESSION = gql`
  mutation CreateCodeSession($projectId: ID!, $input: CodeSessionInput!) {
    createCodeSession(projectId: $projectId, input: $input) {
      id
      name
      description
      language
    }
  }
`;

const CodeEditorPage = () => {
  const { projectId, sessionId } = useParams();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    description: '',
    language: 'javascript',
  });

  const [createCodeSession, { loading: createLoading }] = useMutation(CREATE_CODE_SESSION);

  const handleCreateSession = async () => {
    try {
      const { data } = await createCodeSession({
        variables: {
          projectId,
          input: {
            name: newSession.name,
            description: newSession.description,
            language: newSession.language,
          }
        }
      });

      // Navigate to the new session
      navigate(`/projects/${projectId}/code/${data.createCodeSession.id}`);

      // Reset form and close dialog
      setCreateDialogOpen(false);
      setNewSession({ name: '', description: '', language: 'javascript' });
    } catch (error) {
      console.error('Failed to create code session:', error);
      // TODO: Show error message to user
    }
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Code Editor
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Session
          </Button>
        </Box>

        {/* Code Editor */}
        <Paper sx={{ flex: 1, p: 0 }}>
          {sessionId ? (
            <CodeEditor sessionId={sessionId} />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'text.secondary'
              }}
            >
              <Code sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No code session selected
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Create a new code session or select an existing one to start collaborative coding.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Code Session
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Create Session Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Code Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Name"
            fullWidth
            variant="outlined"
            value={newSession.name}
            onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newSession.description}
            onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Programming Language</InputLabel>
            <Select
              value={newSession.language}
              label="Programming Language"
              onChange={(e) => setNewSession(prev => ({ ...prev, language: e.target.value }))}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={createLoading || !newSession.name.trim()}
          >
            {createLoading ? 'Creating...' : 'Create Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodeEditorPage;