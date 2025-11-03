import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
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
  FormControl,
  InputLabel,
  Select,
  Fab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Person,
  AccessTime,
  PriorityHigh,
  Edit,
  Delete,
} from '@mui/icons-material';
import { format } from 'date-fns';

const GET_PROJECT_BOARD = gql`
  query GetProjectBoard($projectId: ID!) {
    projectBoards(projectId: $projectId) {
      id
      name
      columns {
        id
        name
        position
        limit
        color
        cards {
          id
          title
          description
          assignee {
            id
            username
            firstName
            lastName
            avatar
          }
          labels
          priority
          dueDate
          position
          issue {
            id
            title
            status
            priority
          }
        }
        cardCount
      }
    }
  }
`;

const CREATE_BOARD = gql`
  mutation CreateBoard($projectId: ID!, $input: BoardInput!) {
    createProjectBoard(projectId: $projectId, input: $input) {
      id
      name
    }
  }
`;

const MOVE_CARD = gql`
  mutation MoveCard($input: MoveCardInput!) {
    moveBoardCard(input: $input) {
      id
      column
      position
    }
  }
`;

const CREATE_CARD = gql`
  mutation CreateCard($boardId: ID!, $columnId: ID!, $input: BoardCardInput!) {
    createBoardCard(boardId: $boardId, columnId: $columnId, input: $input) {
      id
      title
      description
      assignee {
        id
        username
        firstName
        lastName
        avatar
      }
      labels
      priority
      dueDate
      position
      issue {
        id
        title
        status
        priority
      }
    }
  }
`;

const KanbanBoard = ({ projectId }) => {
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [createBoardDialog, setCreateBoardDialog] = useState(false);
  const [createCardDialog, setCreateCardDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    priority: 'medium',
    labels: [],
  });

  const { loading, error, data, refetch } = useQuery(GET_PROJECT_BOARD, {
    variables: { projectId },
    skip: !projectId,
  });

  const [createBoard] = useMutation(CREATE_BOARD);
  const [moveCard] = useMutation(MOVE_CARD);
  const [createCard] = useMutation(CREATE_CARD);

  useEffect(() => {
    if (data?.projectBoards && data.projectBoards.length > 0 && !selectedBoard) {
      setSelectedBoard(data.projectBoards[0]);
    }
  }, [data, selectedBoard]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      await moveCard({
        variables: {
          input: {
            cardId: draggableId,
            targetColumnId: destination.droppableId,
            targetPosition: destination.index,
          },
        },
      });

      // Optimistically update the UI
      refetch();
    } catch (error) {
      console.error('Failed to move card:', error);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      await createBoard({
        variables: {
          projectId,
          input: { name: newBoardName.trim() },
        },
      });

      setCreateBoardDialog(false);
      setNewBoardName('');
      refetch();
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleCreateCard = async () => {
    if (!newCard.title.trim() || !selectedColumn) return;

    try {
      await createCard({
        variables: {
          boardId: selectedBoard.id,
          columnId: selectedColumn,
          input: {
            ...newCard,
            labels: newCard.labels.filter(label => label.trim()),
          },
        },
      });

      setCreateCardDialog(false);
      setSelectedColumn(null);
      setNewCard({
        title: '',
        description: '',
        priority: 'medium',
        labels: [],
      });
      refetch();
    } catch (error) {
      console.error('Failed to create card:', error);
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading board: {error.message}
      </Alert>
    );
  }

  const boards = data?.projectBoards || [];

  if (boards.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        textAlign="center"
      >
        <Typography variant="h6" gutterBottom>
          No boards yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your first Kanban board to organize your project tasks.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateBoardDialog(true)}
        >
          Create Board
        </Button>

        {/* Create Board Dialog */}
        <Dialog open={createBoardDialog} onClose={() => setCreateBoardDialog(false)}>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Board Name"
              fullWidth
              variant="outlined"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateBoardDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateBoard} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      {/* Board Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {selectedBoard?.name || 'Project Board'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setCreateBoardDialog(true)}
          >
            New Board
          </Button>
        </Box>
      </Box>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {selectedBoard?.columns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <Box
                key={column.id}
                sx={{
                  minWidth: 300,
                  maxWidth: 300,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: column.color || '#f5f5f5',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      {column.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {column.cardCount}
                      {column.limit && `/${column.limit}`}
                    </Typography>
                  </Box>
                </Paper>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 400,
                        backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      {column.cards
                        .sort((a, b) => a.position - b.position)
                        .map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 1,
                                  cursor: 'grab',
                                  transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                  boxShadow: snapshot.isDragging ? 3 : 1,
                                }}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    {card.title}
                                  </Typography>

                                  {card.description && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mb: 2 }}
                                    >
                                      {card.description.length > 100
                                        ? `${card.description.substring(0, 100)}...`
                                        : card.description
                                      }
                                    </Typography>
                                  )}

                                  {/* Labels */}
                                  {card.labels && card.labels.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                      {card.labels.map((label, idx) => (
                                        <Chip key={idx} label={label} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                      ))}
                                    </Box>
                                  )}

                                  {/* Priority */}
                                  <Box sx={{ mb: 2 }}>
                                    <Chip
                                      label={card.priority}
                                      size="small"
                                      color={getPriorityColor(card.priority)}
                                      icon={getPriorityIcon(card.priority)}
                                    />
                                  </Box>

                                  {/* Assignee and Due Date */}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {card.assignee && (
                                        <>
                                          <Avatar
                                            src={card.assignee.avatar}
                                            sx={{ width: 24, height: 24 }}
                                          >
                                            {card.assignee.firstName.charAt(0)}
                                          </Avatar>
                                          <Typography variant="body2" color="text.secondary">
                                            {card.assignee.firstName}
                                          </Typography>
                                        </>
                                      )}
                                    </Box>

                                    {card.dueDate && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {format(new Date(card.dueDate), 'MMM d')}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>

                                  {/* Issue Link */}
                                  {card.issue && (
                                    <Box sx={{ mt: 1 }}>
                                      <Chip
                                        label={`Issue: ${card.issue.title}`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}

                      {/* Add Card Button */}
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                          setSelectedColumn(column.id);
                          setCreateCardDialog(true);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Add Card
                      </Button>
                    </Box>
                  )}
                </Droppable>
              </Box>
            ))}
        </Box>
      </DragDropContext>

      {/* Create Board Dialog */}
      <Dialog open={createBoardDialog} onClose={() => setCreateBoardDialog(false)}>
        <DialogTitle>Create New Board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Board Name"
            fullWidth
            variant="outlined"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBoardDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBoard} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Card Dialog */}
      <Dialog open={createCardDialog} onClose={() => setCreateCardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Card</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newCard.title}
            onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newCard.description}
            onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newCard.priority}
              label="Priority"
              onChange={(e) => setNewCard(prev => ({ ...prev, priority: e.target.value }))}
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
            value={newCard.labels.join(', ')}
            onChange={(e) => setNewCard(prev => ({
              ...prev,
              labels: e.target.value.split(',').map(label => label.trim()).filter(label => label)
            }))}
            helperText="Enter labels separated by commas"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCardDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCard} variant="contained">
            Create Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;