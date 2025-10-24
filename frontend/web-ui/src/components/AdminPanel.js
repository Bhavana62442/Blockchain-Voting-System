import React, { useState } from 'react';
import { TextField, Button, Typography, Card, CardContent, Grid } from '@mui/material';

export default function AdminPanel() {
  const [elections, setElections] = useState([]);
  const [name, setName] = useState('');

  const addElection = () => {
    if (!name) return;
    setElections([...elections, { id: Date.now(), name, candidates: [] }]);
    setName('');
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Admin Panel
      </Typography>
      <TextField
        label="Election Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <Button variant="contained" color="primary" onClick={addElection}>
        Add Election
      </Button>

      <Grid container spacing={2} style={{ marginTop: 20 }}>
        {elections.map((e) => (
          <Grid item xs={12} sm={6} key={e.id}>
            <Card>
              <CardContent>
                <Typography>{e.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
