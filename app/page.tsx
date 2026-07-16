'use client';
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Sidebar from './components/Sidebar';
import TreeCanvas, { Person } from './components/TreeCanvas';
import Inspector from './components/Inspector';

export default function Home() {
  // Default selected person is Alexander Dupont (id = '1')
  const [selectedPerson, setSelectedPerson] = useState<Person | undefined>({
    id: '1',
    name: 'Alexander Dupont',
    birthDate: 'May 14, 1985',
    birthPlace: 'Oakland, CA',
    spouse: 'Sarah Chen',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    notes: 'Father, Software Engineer, love hiking.',
  });

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Left Sidebar Navigation */}
      <Sidebar />

      {/* 2. Central Family Tree Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
        {/* Top Header Bar */}
        <Box
          sx={{
            height: 64,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            px: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Family Tree: Dupont-Chen
          </Typography>
        </Box>

        {/* Tree Canvas */}
        <TreeCanvas
          selectedPersonId={selectedPerson?.id}
          onSelectPerson={(person) => setSelectedPerson(person)}
        />
      </Box>

      {/* 3. Right Context Inspector */}
      <Inspector
        person={selectedPerson}
        onClose={() => setSelectedPerson(undefined)}
      />
    </Box>
  );
}
