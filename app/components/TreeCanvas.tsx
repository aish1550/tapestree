'use client';
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';

export interface Person {
  id: string;
  name: string;
  birthDate: string;
  birthPlace: string;
  deathDate?: string;
  photoUrl?: string;
  role?: string;
  spouse?: string;
  childrenCount?: number;
  parents?: string[];
  notes?: string;
}

interface TreeCanvasProps {
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

// Sample family data reflecting the visual mockup
const initialPeople: Person[] = [
  {
    id: '1',
    name: 'Alexander Dupont',
    birthDate: 'May 14, 1985',
    birthPlace: 'Oakland, CA',
    spouse: 'Sarah Chen',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    notes: 'Father, Software Engineer, love hiking.',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    birthDate: 'Aug 12, 1987',
    birthPlace: 'San Francisco, CA',
    spouse: 'Alexander Dupont',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
    notes: 'Mother, Pediatrician, avid reader.',
  },
  {
    id: '3',
    name: 'David Dupont',
    birthDate: 'Jan 25, 1952',
    birthPlace: 'Paris, France',
    spouse: 'Maria Dupont',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: '4',
    name: 'Maria Dupont',
    birthDate: 'Jul 09, 1956',
    birthPlace: 'Marseille, France',
    spouse: 'David Dupont',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: '5',
    name: 'Liam Dupont',
    birthDate: 'Oct 04, 2012',
    birthPlace: 'San Francisco, CA',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: '6',
    name: 'Sophie Dupont',
    birthDate: 'Dec 18, 2015',
    birthPlace: 'San Francisco, CA',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120&h=120',
  },
];

export default function TreeCanvas({ onSelectPerson, selectedPersonId }: TreeCanvasProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Zoom / Controls overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: 0.5,
          p: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <IconButton size="small" onClick={handleZoomOut}>
          <ZoomOutIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {zoom}%
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleZoomIn}>
          <ZoomInIcon />
        </IconButton>
        <IconButton size="small" onClick={handleResetZoom}>
          <CenterFocusWeakIcon />
        </IconButton>
      </Box>

      {/* Interactive Family Tree SVG Layout */}
      <Box
        sx={{
          transform: `scale(${zoom / 100})`,
          transition: 'transform 0.15s ease-out',
          width: 800,
          height: 600,
          position: 'relative',
        }}
      >
        {/* Connection Lines (SVG) */}
        <svg
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          {/* David & Maria Marriage Connector */}
          <path d="M 230 180 H 570" stroke="#1E3F20" strokeWidth="2" fill="none" />
          {/* David & Maria Child Drop Line */}
          <path d="M 400 180 V 230" stroke="#1E3F20" strokeWidth="2" fill="none" />

          {/* Parents to Alexander Parent line */}
          <path d="M 400 230 H 260 V 300" stroke="#1E3F20" strokeWidth="2" fill="none" />

          {/* Alexander & Sarah Marriage Connector */}
          <path d="M 260 350 H 540" stroke="#1E3F20" strokeWidth="2" fill="none" />

          {/* Alexander & Sarah Child Drop Line */}
          <path d="M 400 350 V 430" stroke="#1E3F20" strokeWidth="2" fill="none" />
          {/* Children Split Line */}
          <path d="M 260 430 H 540" stroke="#1E3F20" strokeWidth="2" fill="none" />
          {/* Liam Line */}
          <path d="M 260 430 V 470" stroke="#1E3F20" strokeWidth="2" fill="none" />
          {/* Sophie Line */}
          <path d="M 540 430 V 470" stroke="#1E3F20" strokeWidth="2" fill="none" />
        </svg>

        {/* Nodes Layer */}
        {initialPeople.map((person) => {
          // Absolute positions representing tree structure
          let x = 0;
          let y = 0;
          if (person.id === '3') { x = 120; y = 130; } // David
          if (person.id === '4') { x = 460; y = 130; } // Maria
          if (person.id === '1') { x = 150; y = 300; } // Alexander
          if (person.id === '2') { x = 430; y = 300; } // Sarah
          if (person.id === '5') { x = 150; y = 470; } // Liam
          if (person.id === '6') { x = 430; y = 470; } // Sophie

          const isSelected = selectedPersonId === person.id;

          return (
            <Card
              key={person.id}
              onClick={() => onSelectPerson(person)}
              sx={{
                position: 'absolute',
                left: x,
                top: y,
                width: 220,
                cursor: 'pointer',
                border: isSelected ? '2px solid' : '1px solid',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  borderColor: isSelected ? 'primary.main' : 'rgba(30, 63, 32, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                <Avatar src={person.photoUrl} alt={person.name} sx={{ width: 44, height: 44 }} />
                <Box>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', width: 130 }}>
                    {person.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {person.birthDate.split(',')[1]?.trim() || '1985'} – Present
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
