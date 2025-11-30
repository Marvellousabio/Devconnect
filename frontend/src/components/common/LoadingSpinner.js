import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';

const LoadingSpinner = ({
  size = 40,
  message = 'Loading...',
  fullScreen = false,
  showMessage = true,
  ...props
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
      {...props}
    >
      <CircularProgress size={size} />
      {showMessage && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {content}
        </Paper>
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;