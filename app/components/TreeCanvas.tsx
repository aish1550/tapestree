'use client';
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';

export interface Person {
  id: string;
  firstName: string;
  lastName?: string | null;
  name?: string; // fallback
  birthDate: string;
  birthPlace: string | null;
  deathDate?: string | null;
  photoUrl: string | null;
  bio: string | null;
  role?: 'focus' | 'parent' | 'spouse' | 'child';
  spouse?: string;
}

interface TreeCanvasProps {
  people: Person[];
  relationships: any[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export default function TreeCanvas({ people, relationships, onSelectPerson, selectedPersonId }: TreeCanvasProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  // Group people by role for layout coordinates
  const focusPerson = people.find((p) => p.role === 'focus');
  const spouse = people.find((p) => p.role === 'spouse');
  const parents = people.filter((p) => p.role === 'parent');
  const children = people.filter((p) => p.role === 'child');

  // Node dimension constants
  const cardWidth = 220;
  const cardHeight = 76;

  // Calculate coordinates for nodes
  const nodeCoords = new Map<string, { x: number; y: number }>();

  // 1. Focus Person
  if (focusPerson) {
    nodeCoords.set(focusPerson.id, { x: 260, y: 280 });
  }

  // 2. Spouse
  if (spouse) {
    nodeCoords.set(spouse.id, { x: 520, y: 280 });
  }

  // 3. Parents (Top Row y = 100)
  if (parents.length === 1) {
    nodeCoords.set(parents[0].id, { x: 390, y: 100 });
  } else if (parents.length >= 2) {
    nodeCoords.set(parents[0].id, { x: 260, y: 100 });
    nodeCoords.set(parents[1].id, { x: 520, y: 100 });
  }

  // 4. Children (Bottom Row y = 460)
  if (children.length > 0) {
    const spaceBetween = 250;
    const totalChildrenWidth = (children.length - 1) * spaceBetween;
    // Center children around the midpoint (x = 500)
    const startX = 500 - totalChildrenWidth / 2 - cardWidth / 2;

    children.forEach((child, index) => {
      nodeCoords.set(child.id, { x: startX + index * spaceBetween, y: 460 });
    });
  }

  // Find canvas dimensions based on child nodes to allow scrolling
  const minX = Math.min(...Array.from(nodeCoords.values()).map(c => c.x), 50) - 50;
  const maxX = Math.max(...Array.from(nodeCoords.values()).map(c => c.x + cardWidth), 950) + 50;
  const canvasWidth = maxX - minX;

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

      {/* Dynamic Family Tree Canvas */}
      <Box
        sx={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
          width: canvasWidth,
          height: 650,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Dynamic SVG Connections */}
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
          {/* A. Draw Parents to Focus Person Links */}
          {parents.length === 2 && nodeCoords.has(parents[0].id) && nodeCoords.has(parents[1].id) && focusPerson && (
            <>
              {/* Horizontal bar between parents */}
              <path
                d={`M ${nodeCoords.get(parents[0].id)!.x + cardWidth / 2} 138 H ${nodeCoords.get(parents[1].id)!.x + cardWidth / 2}`}
                stroke="#1E3F20"
                strokeWidth="2"
                fill="none"
              />
              {/* Drop line from parents midpoint down to focus person */}
              <path
                d={`M 500 138 V 280`}
                stroke="#1E3F20"
                strokeWidth="2"
                fill="none"
              />
            </>
          )}
          {parents.length === 1 && nodeCoords.has(parents[0].id) && focusPerson && (
            <path
              d={`M ${nodeCoords.get(parents[0].id)!.x + cardWidth / 2} 176 V 280`}
              stroke="#1E3F20"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* B. Draw Spousal Link between Focus Person and Spouse */}
          {focusPerson && spouse && nodeCoords.has(focusPerson.id) && nodeCoords.has(spouse.id) && (
            <path
              d={`M ${nodeCoords.get(focusPerson.id)!.x + cardWidth} 318 H ${nodeCoords.get(spouse.id)!.x}`}
              stroke="#1E3F20"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* C. Draw Children drop lines from Focus-Spouse connection */}
          {children.length > 0 && focusPerson && (
            <>
              {/* Start point of child connection (middle of focus and spouse or middle of focus if single parent) */}
              {(() => {
                const parentX = spouse && nodeCoords.has(spouse.id)
                  ? (nodeCoords.get(focusPerson.id)!.x + cardWidth + nodeCoords.get(spouse.id)!.x) / 2
                  : nodeCoords.get(focusPerson.id)!.x + cardWidth / 2;

                const firstChildX = nodeCoords.get(children[0].id)!.x + cardWidth / 2;
                const lastChildX = nodeCoords.get(children[children.length - 1].id)!.x + cardWidth / 2;

                return (
                  <>
                    {/* Line dropping from marriage bar to children split bar */}
                    <path
                      d={`M ${parentX} 318 V 390`}
                      stroke="#1E3F20"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Horizontal split bar across children */}
                    <path
                      d={`M ${firstChildX} 390 H ${lastChildX}`}
                      stroke="#1E3F20"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Individual drop lines into child cards */}
                    {children.map((child) => (
                      <path
                        key={`line-${child.id}`}
                        d={`M ${nodeCoords.get(child.id)!.x + cardWidth / 2} 390 V 460`}
                        stroke="#1E3F20"
                        strokeWidth="2"
                        fill="none"
                      />
                    ))}
                  </>
                );
              })()}
            </>
          )}
        </svg>

        {/* Render Cards */}
        {people.map((person) => {
          const coords = nodeCoords.get(person.id);
          if (!coords) return null;

          const isSelected = selectedPersonId === person.id;
          const fullName = `${person.firstName} ${person.lastName || ''}`;

          return (
            <Card
              key={person.id}
              onClick={() => onSelectPerson(person)}
              sx={{
                position: 'absolute',
                left: coords.x - minX, // Offset by minX to keep nodes visible within canvas width
                top: coords.y,
                width: cardWidth,
                cursor: 'pointer',
                border: isSelected ? '2px solid' : '1px solid',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  borderColor: isSelected ? 'primary.main' : 'rgba(30, 63, 32, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                <Avatar src={person.photoUrl || undefined} alt={fullName} sx={{ width: 44, height: 44 }}>
                  {person.firstName[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', width: 130 }}>
                    {fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {person.birthDate.split(',')[1]?.trim() || person.birthDate} – {person.deathDate ? person.deathDate.split(',')[1]?.trim() : 'Present'}
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
