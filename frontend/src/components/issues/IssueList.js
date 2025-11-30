import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add,
  FilterList,
  Sort,
  BugReport,
  Person,
  PriorityHigh,
  AccessTime,
} from '@mui/icons-material';
import { format } from 'date-fns';

const GET_ISSUES = gql`
  query GetIssues($projectId: ID!, $filters: IssueFilters, $limit: Int, $offset: Int) {
    issues(projectId: $projectId, filters: $filters, limit: $limit, offset: $offset) {
      id
      title
      description
      status
      priority
      labels
      creator {
        id
        username
        firstName
        lastName
        avatar
      }
      assignee {
        id
        username
        firstName
        lastName
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_ISSUE = gql`
  mutation CreateIssue($projectId: ID!, $input: IssueInput!) {
    createIssue(projectId: $projectId, input: $input) {
      id
      title
      description
      status
      priority
      labels
      creator {
        id
        username
        firstName
        lastName
        avatar
      }
      assignee {
        id
        username
        firstName
        lastName
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

const IssueList = ({ projectId }) => {
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'medium',
    labels: [],
  });

  const { loading, error, data, refetch } = useQuery(GET_ISSUES, {
    variables: { projectId, filters },
    skip: !projectId,
  });

  const [createIssue, { loading: createLoading }] = useMutation(CREATE_ISSUE);

  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleSortClick = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleSortClose = () => {
    setSortMenuAnchor(null);
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status
    }));
    handleFilterClose();
  };

  const handlePriorityFilter = (priority) => {
    setFilters(prev => ({
      ...prev,
      priority: priority === 'all' ? undefined : priority
    }));
    handleFilterClose();
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    handleSortClose();
  };

  const handleCreateIssue = async () => {
    try {
      await createIssue({
        variables: {
          projectId,
          input: {
            title: newIssue.title,
            description: newIssue.description,
            priority: newIssue.priority,
            labels: newIssue.labels,
          }
        }
      });

      // Reset form and close dialog
      setCreateDialogOpen(false);
      setNewIssue({ title: '', description: '', priority: 'medium', labels: [] });

      // Refetch issues to show the new one
      refetch();
    } catch (error) {
      console.error('Failed to create issue:', error);
      // TODO: Show error message to user
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'review':
        return 'info';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    return priority === 'urgent' || priority === 'high' ? <PriorityHigh /> : null;
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
        Error loading issues: {error.message}
      </Alert>
    );
  }

  const issues = data?.issues || [];

  return (
    <Box>
      {/* Header with filters and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Issues ({issues.length})
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Sort />}
            onClick={handleSortClick}
          >
            Sort
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Issue
          </Button>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleStatusFilter('all')}>
          <ListItemText>All Status</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('open')}>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('in_progress')}>
          <ListItemText>In Progress</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('review')}>
          <ListItemText>Review</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('closed')}>
          <ListItemText>Closed</ListItemText>
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => handleSortChange('createdAt')}>
          <ListItemText>Created Date</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('updatedAt')}>
          <ListItemText>Updated Date</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('priority')}>
          <ListItemText>Priority</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('status')}>
          <ListItemText>Status</ListItemText>
        </MenuItem>
      </Menu>

      {/* Issues List */}
      {issues.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <BugReport sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No issues found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {Object.keys(filters).length > 0
              ? 'Try adjusting your filters to see more issues.'
              : 'Create your first issue to get started with project management.'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Issue
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {issues.map((issue) => (
            <Card key={issue.id} sx={{ cursor: 'pointer' }} onClick={() => {/* Navigate to issue detail */}}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {issue.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {issue.description.length > 150
                        ? `${issue.description.substring(0, 150)}...`
                        : issue.description
                      }
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Chip
                      label={issue.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(issue.status)}
                    />
                    <Chip
                      label={issue.priority}
                      size="small"
                      color={getPriorityColor(issue.priority)}
                      icon={getPriorityIcon(issue.priority)}
                    />
                  </Box>
                </Box>

                {/* Labels */}
                {issue.labels && issue.labels.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {issue.labels.map((label, index) => (
                      <Chip key={index} label={label} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                )}

                {/* Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={issue.creator.avatar} sx={{ width: 24, height: 24 }}>
                        {issue.creator.firstName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {issue.creator.firstName} {issue.creator.lastName}
                      </Typography>
                    </Box>

                    {issue.assignee && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Avatar src={issue.assignee.avatar} sx={{ width: 24, height: 24 }}>
                          {issue.assignee.firstName.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {issue.assignee.firstName} {issue.assignee.lastName}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(issue.updatedAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Issue Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Issue</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newIssue.title}
            onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newIssue.description}
            onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newIssue.priority}
              label="Priority"
              onChange={(e) => setNewIssue(prev => ({ ...prev, priority: e.target.value }))}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Labels (comma-separated)"
            fullWidth
            variant="outlined"
            value={newIssue.labels.join(', ')}
            onChange={(e) => setNewIssue(prev => ({
              ...prev,
              labels: e.target.value.split(',').map(label => label.trim()).filter(label => label)
            }))}
            helperText="Enter labels separated by commas"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateIssue}
            variant="contained"
            disabled={createLoading || !newIssue.title.trim()}
          >
            {createLoading ? 'Creating...' : 'Create Issue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueList;