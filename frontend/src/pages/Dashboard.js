import React from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Folder, People, Chat } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    me {
      id
      firstName
      lastName
      username
    }
    myProjects {
      id
      name
      description
      status
      visibility
      members {
        user {
          id
          username
          firstName
          lastName
          avatar
        }
        role
      }
      createdAt
    }
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_DASHBOARD_DATA);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading dashboard: {error.message}
        </Alert>
      </Container>
    );
  }

  const { me, myProjects } = data;

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {me.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your projects and activities.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/projects/new')}
          >
            Create Project
          </Button>
          <Button
            variant="outlined"
            startIcon={<People />}
            onClick={() => navigate('/users')}
          >
            Find Collaborators
          </Button>
          <Button
            variant="outlined"
            startIcon={<Chat />}
            onClick={() => navigate('/messages')}
          >
            Open Messages
          </Button>
        </Box>
      </Box>

      {/* Projects Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Your Projects ({myProjects.length})
          </Typography>
          <Button
            variant="text"
            onClick={() => navigate('/projects')}
          >
            View All
          </Button>
        </Box>

        {myProjects.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Folder sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first project to start collaborating with others.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/projects/new')}
            >
              Create Your First Project
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {myProjects.slice(0, 6).map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                        {project.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
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
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {project.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
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

                      <Typography variant="caption" color="text.secondary">
                        {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Recent Activity Placeholder */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Recent activity feed will be implemented here. This will show recent commits,
            issue updates, messages, and other project activities.
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;