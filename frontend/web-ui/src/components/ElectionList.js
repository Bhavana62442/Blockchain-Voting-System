import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { generateChameleonHash } from '../utils/chameleonHash';

export default function ElectionList({ voter, onBack }) {
  const elections = [
    { id: 1, name: 'Student Council', candidates: ['Alice', 'Bob', 'Carol'] },
    { id: 2, name: 'Tech Committee', candidates: ['Dave', 'Eve'] },
  ];

  const [selectedElection, setSelectedElection] = useState(null);
  const [voteResult, setVoteResult] = useState(null);

  const castVote = (candidate) => {
    const { hash } = generateChameleonHash(candidate);
    setVoteResult(`Vote cast for "${candidate}" with hash: ${hash}`);
  };

  if (!selectedElection)
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Hello, {voter.name}
        </Typography>
        <Grid container spacing={2}>
          {elections.map((e) => (
            <Grid item xs={12} sm={6} key={e.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{e.name}</Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setSelectedElection(e)}
                    style={{ marginTop: 10 }}
                  >
                    Vote
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button onClick={onBack} style={{ marginTop: 20 }}>
          Logout
        </Button>
      </div>
    );

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Election: {selectedElection.name}
      </Typography>
      <Grid container spacing={2}>
        {selectedElection.candidates.map((c) => (
          <Grid item xs={12} sm={6} key={c}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => castVote(c)}
                  style={{ marginTop: 10 }}
                >
                  Cast Vote
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {voteResult && (
        <Typography variant="body1" style={{ marginTop: 20 }}>
          {voteResult}
        </Typography>
      )}
      <Button onClick={() => setSelectedElection(null)} style={{ marginTop: 20 }}>
        Back to Elections
      </Button>
    </div>
  );
}
