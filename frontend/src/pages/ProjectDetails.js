import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  People,
  Folder,
  Chat,
  BugReport,
  GitHub,
  Settings,
  Add,
} from '@mui/icons-material';
import IssueList from '../components/issues/IssueList';
import KanbanBoard from '../components/boards/KanbanBoard';
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatRoom from '../components/chat/ChatRoom';
import RepositoryList from '../components/repositories/RepositoryList';

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
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
      members {
        user {
          id
          username
          firstName
          lastName
          avatar
        }
        role
        joinedAt
      }
      status
      visibility
      tags
      githubRepo
      website
      createdAt
      updatedAt
    }
  }
`;

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const { loading, error, data } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading project: {error.message}
        </Alert>
      </Container>
    );
  }

  const { project } = data;

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Project not found
        </Alert>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'archived':
        return 'default';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getVisibilityColor = (visibility) => {
    return visibility === 'public' ? 'primary' : 'secondary';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'error';
      case 'admin':
        return 'warning';
      case 'member':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Project Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {project.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={project.status}
                size="small"
                color={getStatusColor(project.status)}
              />
              <Chip
                label={project.visibility}
                size="small"
                variant="outlined"
                color={getVisibilityColor(project.visibility)}
              />
            </Box>

            {project.tags && project.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {project.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" sx={{ mr: 1 }} />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => navigate(`/projects/${projectId}/settings`)}
            >
              Settings
            </Button>
          </Box>
        </Box>

        {/* Project Links */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {project.githubRepo && (
            <Button
              variant="outlined"
              startIcon={<GitHub />}
              href={project.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Button>
          )}
          {project.website && (
            <Button
              variant="outlined"
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </Button>
          )}
        </Box>

        {/* Members */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AvatarGroup max={6} sx={{ mr: 2 }}>
              {project.members.map((member) => (
                <Avatar
                  key={member.user.id}
                  src={member.user.avatar}
                  alt={member.user.firstName}
                >
                  {member.user.firstName.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
            <Typography variant="body2" color="text.secondary">
              {project.members.length} member{project.members.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<People />}
            onClick={() => navigate(`/projects/${projectId}/members`)}
          >
            Manage Members
          </Button>
        </Box>
      </Paper>

      {/* Project Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="project tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Issues" />
          <Tab label="Board" />
          <Tab label="Chat" />
          <Tab label="Repositories" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Project Overview
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Quick Stats
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Created: {new Date(project.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Owner: {project.owner.firstName} {project.owner.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Members: {project.members.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Activity
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recent activity will be displayed here, including:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        • Issue updates
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        • New commits
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        • Member changes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <IssueList projectId={projectId} />
          )}

          {activeTab === 2 && (
            <KanbanBoard projectId={projectId} />
          )}

          {activeTab === 3 && (
            <Box sx={{ height: '600px', display: 'flex' }}>
              <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider' }}>
                <ChatRoomList
                  projectId={projectId}
                  onRoomSelect={(roomId) => {
                    setSelectedRoomId(roomId);
                    setActiveTab(3); // Keep on chat tab
                  }}
                  selectedRoomId={selectedRoomId}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ChatRoom roomId={selectedRoomId} />
              </Box>
            </Box>
          )}

          {activeTab === 4 && (
            <RepositoryList projectId={projectId} />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectDetails;