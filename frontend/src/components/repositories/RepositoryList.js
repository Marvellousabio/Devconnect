import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Menu,
  MenuItem as MuiMenuItem,
  CircularProgress,
  Alert,
  Fab,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add,
  Star,
  StarBorder,
  Visibility,
  GitHub,
  Code,
  ForkRight,
  RemoveRedEye,
  MoreVert,
  Edit,
  Delete,
  Sync,
} from '@mui/icons-material';
import { format } from 'date-fns';

const GET_REPOSITORIES = gql`
  query GetRepositories($projectId: ID!) {
    repositories(projectId: $projectId) {
      id
      name
      description
      owner {
        id
        username
        firstName
        lastName
        avatar
      }
      visibility
      language
      stars
      forks
      watchers
      license
      topics
      githubUrl
      lastSync
      createdAt
      updatedAt
    }
  }
`;

const CREATE_REPOSITORY = gql`
  mutation CreateRepository($projectId: ID!, $input: RepositoryInput!) {
    createRepository(projectId: $projectId, input: $input) {
      id
      name
      description
      visibility
      language
      license
      topics
    }
  }
`;

const STAR_REPOSITORY = gql`
  mutation StarRepository($id: ID!) {
    starRepository(id: $id) {
      id
      stars
    }
  }
`;

const UNSTAR_REPOSITORY = gql`
  mutation UnstarRepository($id: ID!) {
    unstarRepository(id: $id) {
      id
      stars
    }
  }
`;

const RepositoryList = ({ projectId }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    visibility: 'private',
    language: '',
    license: '',
    topics: [],
    githubUrl: '',
  });

  const { loading, error, data, refetch } = useQuery(GET_REPOSITORIES, {
    variables: { projectId },
    skip: !projectId,
  });

  const [createRepository] = useMutation(CREATE_REPOSITORY);
  const [starRepository] = useMutation(STAR_REPOSITORY);
  const [unstarRepository] = useMutation(UNSTAR_REPOSITORY);

  const handleCreateRepository = async () => {
    if (!newRepo.name.trim()) return;

    try {
      await createRepository({
        variables: {
          projectId,
          input: {
            ...newRepo,
            topics: newRepo.topics.filter(topic => topic.trim()),
          }
        }
      });

      setCreateDialogOpen(false);
      setNewRepo({
        name: '',
        description: '',
        visibility: 'private',
        language: '',
        license: '',
        topics: [],
        githubUrl: '',
      });
      refetch();
    } catch (error) {
      console.error('Failed to create repository:', error);
    }
  };

  const handleStarToggle = async (repoId, isStarred) => {
    try {
      if (isStarred) {
        await unstarRepository({ variables: { id: repoId } });
      } else {
        await starRepository({ variables: { id: repoId } });
      }
      refetch();
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleMenuOpen = (event, repo) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRepo(repo);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRepo(null);
  };

  const handleTopicAdd = (topic) => {
    if (topic.trim() && !newRepo.topics.includes(topic.trim())) {
      setNewRepo(prev => ({
        ...prev,
        topics: [...prev.topics, topic.trim()]
      }));
    }
  };

  const handleTopicRemove = (topicToRemove) => {
    setNewRepo(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }));
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
    return colors[language?.toLowerCase()] || '#666';
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
        Error loading repositories: {error.message}
      </Alert>
    );
  }

  const repositories = data?.repositories || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Repositories ({repositories.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Repository
        </Button>
      </Box>

      {/* Repository Grid */}
      {repositories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Code sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No repositories yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first repository to start managing your project's code.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Repository
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {repositories.map((repo) => (
            <Grid item xs={12} md={6} lg={4} key={repo.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  {/* Repository Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {repo.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {repo.description || 'No description'}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, repo)}>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* Repository Meta */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar
                        src={repo.owner.avatar}
                        sx={{ width: 20, height: 20 }}
                      >
                        {repo.owner.firstName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {repo.owner.firstName} {repo.owner.lastName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Chip
                        label={repo.visibility}
                        size="small"
                        color={repo.visibility === 'public' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                      {repo.language && (
                        <Chip
                          label={repo.language}
                          size="small"
                          sx={{
                            backgroundColor: getLanguageColor(repo.language),
                            color: 'white'
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Topics */}
                  {repo.topics && repo.topics.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {repo.topics.slice(0, 3).map((topic, index) => (
                        <Chip key={index} label={topic} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                      {repo.topics.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{repo.topics.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Stats */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {repo.stars}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ForkRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {repo.forks}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RemoveRedEye sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {repo.watchers}
                        </Typography>
                      </Box>
                    </Box>

                    {repo.githubUrl && (
                      <IconButton
                        size="small"
                        href={repo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GitHub sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>

                  {/* Last Updated */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Updated {format(new Date(repo.updatedAt), 'MMM d, yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Repository Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Repository</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Repository Name"
            fullWidth
            variant="outlined"
            value={newRepo.name}
            onChange={(e) => setNewRepo(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newRepo.description}
            onChange={(e) => setNewRepo(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={newRepo.visibility}
              label="Visibility"
              onChange={(e) => setNewRepo(prev => ({ ...prev, visibility: e.target.value }))}
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Primary Language"
            fullWidth
            variant="outlined"
            value={newRepo.language}
            onChange={(e) => setNewRepo(prev => ({ ...prev, language: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="License"
            fullWidth
            variant="outlined"
            value={newRepo.license}
            onChange={(e) => setNewRepo(prev => ({ ...prev, license: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="GitHub URL (optional)"
            fullWidth
            variant="outlined"
            value={newRepo.githubUrl}
            onChange={(e) => setNewRepo(prev => ({ ...prev, githubUrl: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Add Topic"
            fullWidth
            variant="outlined"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTopicAdd(e.target.value);
                e.target.value = '';
              }
            }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {newRepo.topics.map((topic, index) => (
              <Chip
                key={index}
                label={topic}
                onDelete={() => handleTopicRemove(topic)}
                size="small"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRepository} variant="contained">
            Create Repository
          </Button>
        </DialogActions>
      </Dialog>

      {/* Repository Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MuiMenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MuiMenuItem>
        <MuiMenuItem onClick={handleMenuClose}>
          <Sync sx={{ mr: 1 }} />
          Sync with GitHub
        </MuiMenuItem>
        <MuiMenuItem onClick={handleMenuClose}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MuiMenuItem>
      </Menu>
    </Box>
  );
};

export default RepositoryList;