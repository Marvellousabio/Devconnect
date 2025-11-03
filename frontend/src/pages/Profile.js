import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  GitHub,
  LinkedIn,
  Language,
  LocationOn,
  Work,
  Code,
  Folder,
  BugReport,
  Chat,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID) {
    user(id: $id) {
      id
      username
      email
      firstName
      lastName
      avatar
      bio
      skills
      githubUsername
      linkedinUrl
      website
      location
      isActive
      lastLogin
      createdAt
      updatedAt
    }
  }
`;

const GET_USER_PROJECTS = gql`
  query GetUserProjects($userId: ID!) {
    userProjects(userId: $userId) {
      id
      name
      description
      status
      visibility
      owner {
        id
        username
      }
      members {
        user {
          id
          username
        }
        role
      }
      createdAt
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UserUpdateInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      firstName
      lastName
      avatar
      bio
      skills
      githubUsername
      linkedinUrl
      website
      location
      updatedAt
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

const Profile = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Get user ID from URL params or use current user
  const userId = window.location.pathname.split('/').pop();
  const isOwnProfile = !userId || userId === currentUser?.id || userId === 'profile';

  const { loading: profileLoading, error: profileError, data: profileDataResponse, refetch: refetchProfile } = useQuery(GET_USER_PROFILE, {
    variables: { id: isOwnProfile ? undefined : userId },
    skip: !currentUser,
  });

  const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_USER_PROJECTS, {
    variables: { userId: isOwnProfile ? currentUser?.id : userId },
    skip: !currentUser || !isOwnProfile,
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  React.useEffect(() => {
    if (profileDataResponse?.user) {
      setProfileData(profileDataResponse.user);
    }
  }, [profileDataResponse]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setProfileData(profileDataResponse?.user || {});
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const input = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatar: profileData.avatar,
        bio: profileData.bio,
        skills: profileData.skills?.filter(skill => skill.trim()),
        githubUsername: profileData.githubUsername,
        linkedinUrl: profileData.linkedinUrl,
        website: profileData.website,
        location: profileData.location,
      };

      await updateProfile({ variables: { input } });
      setIsEditing(false);
      refetchProfile();
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }

    try {
      await changePassword({
        variables: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      });
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (error) {
      setErrors({ password: error.message });
    }
  };

  const handleSkillAdd = (skill) => {
    if (skill.trim() && !profileData.skills?.includes(skill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill.trim()]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  if (profileLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (profileError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading profile: {profileError.message}
        </Alert>
      </Container>
    );
  }

  const user = profileDataResponse?.user;
  const projects = projectsData?.userProjects || [];

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          User not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Avatar
            src={user.avatar}
            sx={{ width: 120, height: 120, fontSize: 48 }}
          >
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  @{user.username}
                </Typography>
                {user.bio && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {user.bio}
                  </Typography>
                )}
              </Box>

              {isOwnProfile && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={isEditing ? "outlined" : "contained"}
                    startIcon={isEditing ? <Cancel /> : <Edit />}
                    onClick={handleEditToggle}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                    >
                      Save
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            {/* Profile Links */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">{user.email}</Typography>
              </Box>

              {user.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2">{user.location}</Typography>
                </Box>
              )}
            </Box>

            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {user.githubUsername && (
                <Button
                  variant="outlined"
                  startIcon={<GitHub />}
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  GitHub
                </Button>
              )}

              {user.linkedinUrl && (
                <Button
                  variant="outlined"
                  startIcon={<LinkedIn />}
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  LinkedIn
                </Button>
              )}

              {user.website && (
                <Button
                  variant="outlined"
                  startIcon={<Language />}
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  Website
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          {isOwnProfile && <Tab label="Projects" />}
          <Tab label="Activity" />
          {isOwnProfile && <Tab label="Settings" />}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Profile Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
                      </Typography>
                      {user.lastLogin && (
                        <Typography variant="body2" color="text.secondary">
                          Last login {format(new Date(user.lastLogin), 'MMM d, yyyy')}
                        </Typography>
                      )}
                    </Box>

                    {isEditing ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Bio"
                          multiline
                          rows={3}
                          value={profileData.bio || ''}
                          onChange={(e) => handleProfileChange('bio', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Location"
                          value={profileData.location || ''}
                          onChange={(e) => handleProfileChange('location', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="GitHub Username"
                          value={profileData.githubUsername || ''}
                          onChange={(e) => handleProfileChange('githubUsername', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="LinkedIn URL"
                          value={profileData.linkedinUrl || ''}
                          onChange={(e) => handleProfileChange('linkedinUrl', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Website"
                          value={profileData.website || ''}
                          onChange={(e) => handleProfileChange('website', e.target.value)}
                          fullWidth
                        />
                      </Box>
                    ) : (
                      <Box>
                        {user.bio && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {user.bio}
                          </Typography>
                        )}
                        {user.location && (
                          <Typography variant="body2" color="text.secondary">
                            📍 {user.location}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Skills & Technologies
                    </Typography>
                    {isEditing ? (
                      <Box>
                        <TextField
                          label="Add Skill"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSkillAdd(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {profileData.skills?.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              onDelete={() => handleSkillRemove(skill)}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {user.skills?.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {(!user.skills || user.skills.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            No skills added yet.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Projects Tab */}
          {activeTab === 1 && isOwnProfile && (
            <Box>
              <Typography variant="h6" gutterBottom>
                My Projects ({projects.length})
              </Typography>

              {projectsLoading ? (
                <CircularProgress />
              ) : projectsError ? (
                <Alert severity="error">
                  Error loading projects: {projectsError.message}
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {projects.map((project) => (
                    <Grid item xs={12} md={6} lg={4} key={project.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {project.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={project.visibility}
                              size="small"
                              color={project.visibility === 'public' ? 'primary' : 'default'}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(project.createdAt), 'MMM yyyy')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Activity Tab */}
          {activeTab === (isOwnProfile ? 2 : 1) && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity feed will be implemented here, showing recent contributions,
                commits, issues, and project updates.
              </Typography>
            </Box>
          )}

          {/* Settings Tab */}
          {activeTab === 3 && isOwnProfile && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Update your password to keep your account secure.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="error">
                    Danger Zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Once you deactivate your account, there is no going back.
                  </Typography>
                  <Button variant="outlined" color="error">
                    Deactivate Account
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
          {errors.password && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.password}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;