import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { authenticateVoter } from '../utils/digilockerMock';

export default function VoterLogin({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const voterDoc = await authenticateVoter();
    onLogin(voterDoc);
    setLoading(false);
  };

  return (
    <Card>
      <CardContent style={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Welcome to Blockchain Voting
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogin} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login via DigiLocker'}
        </Button>
      </CardContent>
    </Card>
  );
}
