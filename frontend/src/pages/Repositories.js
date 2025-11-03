import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import RepositoryList from '../components/repositories/RepositoryList';

const Repositories = () => {
  const { projectId } = useParams();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Project Repositories
      </Typography>

      <Box sx={{ mt: 3 }}>
        <RepositoryList projectId={projectId} />
      </Box>
    </Container>
  );
};

export default Repositories;