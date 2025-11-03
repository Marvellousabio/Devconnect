import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DeleteForever, Lock } from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

const DEACTIVATE_ACCOUNT = gql`
  mutation DeactivateAccount {
    deactivateAccount
  }
`;

const Settings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const { logout } = useAuth();

  const [changePassword, { loading: changingPassword }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    },
    onError: (error) => {
      setPasswordError(error.message || 'Failed to change password');
      setPasswordSuccess('');
    },
  });

  const [deactivateAccount, { loading: deactivating }] = useMutation(DEACTIVATE_ACCOUNT, {
    onCompleted: () => {
      logout();
    },
    onError: (error) => {
      console.error('Failed to deactivate account:', error);
    },
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    if (passwordError) setPasswordError('');
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      await changePassword({
        variables: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      await deactivateAccount();
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Change Password Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Lock sx={{ mr: 1 }} />
          Change Password
        </Typography>

        {passwordSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {passwordSuccess}
          </Alert>
        )}

        {passwordError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {passwordError}
          </Alert>
        )}

        <Box component="form" onSubmit={handlePasswordSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            disabled={changingPassword}
          />

          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
            disabled={changingPassword}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
            disabled={changingPassword}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={changingPassword}
          >
            {changingPassword ? 'Changing Password...' : 'Change Password'}
          </Button>
        </Box>
      </Paper>

      {/* Account Settings Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage your account settings and preferences.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Once you deactivate your account, there is no going back. Please be certain.
          </Typography>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={() => setShowDeactivateDialog(true)}
          >
            Deactivate Account
          </Button>
        </Box>
      </Paper>

      {/* Deactivate Account Dialog */}
      <Dialog
        open={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        aria-labelledby="deactivate-dialog-title"
        aria-describedby="deactivate-dialog-description"
      >
        <DialogTitle id="deactivate-dialog-title">
          Deactivate Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="deactivate-dialog-description">
            Are you sure you want to deactivate your account? This action cannot be undone.
            All your data will be permanently removed from our servers.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeactivateDialog(false)}
            disabled={deactivating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeactivateAccount}
            color="error"
            variant="contained"
            disabled={deactivating}
          >
            {deactivating ? 'Deactivating...' : 'Deactivate Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;