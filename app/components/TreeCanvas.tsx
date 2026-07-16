'use client';
import React, { useState, useRef, useEffect } from 'react';
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
  x: number;
  y: number;
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
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Drag to pan state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);

  const cardWidth = 220;
  const cardHeight = 76;

  // 1. Calculate boundaries to set canvas size dynamically
  const paddingRight = 600;
  const paddingBottom = 600;
  const maxX = Math.max(...people.map((p) => p.x), 1000) + paddingRight;
  const maxY = Math.max(...people.map((p) => p.y), 1000) + paddingBottom;

  const scale = zoom / 100;

  // 2. Smoothly scroll-to-center the selected node when focus changes
  useEffect(() => {
    if (!selectedPersonId || !viewportRef.current) return;
    const person = people.find((p) => p.id === selectedPersonId);
    if (!person) return;

    const viewport = viewportRef.current;
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;

    // Target scroll coordinates centered on node
    const targetLeft = person.x * scale - viewportWidth / 2 + (cardWidth * scale) / 2;
    const targetTop = person.y * scale - viewportHeight / 2 + (cardHeight * scale) / 2;

    viewport.scrollTo({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  }, [selectedPersonId, zoom, people, scale]);

  // 3. Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 30));
  const handleResetZoom = () => {
    setZoom(100);
    // Recenter on founder
    const founder = people.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.birthDate).getTime();
      const currentDate = new Date(current.birthDate).getTime();
      return currentDate < oldestDate ? current : oldest;
    }, people[0]);

    if (founder && viewportRef.current) {
      const viewport = viewportRef.current;
      viewport.scrollTo({
        left: founder.x - viewport.clientWidth / 2 + cardWidth / 2,
        top: founder.y - viewport.clientHeight / 2 + cardHeight / 2,
        behavior: 'smooth',
      });
    }
  };

  // 4. Mouse Drag handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on left-click
    if (e.button !== 0 || !viewportRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - viewportRef.current.offsetLeft;
    startYRef.current = e.pageY - viewportRef.current.offsetTop;
    scrollLeftRef.current = viewportRef.current.scrollLeft;
    scrollTopRef.current = viewportRef.current.scrollTop;
    viewportRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !viewportRef.current) return;
    e.preventDefault();
    const x = e.pageX - viewportRef.current.offsetLeft;
    const y = e.pageY - viewportRef.current.offsetTop;
    const walkX = x - startXRef.current;
    const walkY = y - startYRef.current;
    viewportRef.current.scrollLeft = scrollLeftRef.current - walkX;
    viewportRef.current.scrollTop = scrollTopRef.current - walkY;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    if (viewportRef.current) {
      viewportRef.current.style.cursor = 'grab';
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Zoom Controls Overlay */}
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

      {/* Viewport Frame (Scrollable Container) */}
      <Box
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        sx={{
          flexGrow: 1,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          cursor: 'grab',
          position: 'relative',
          userSelect: 'none',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(30, 63, 32, 0.2)',
            borderRadius: '4px',
          },
        }}
      >
        {/* Infinite Scaling Grid Canvas */}
        <Box
          sx={{
            width: maxX * scale,
            height: maxY * scale,
            position: 'relative',
            transformOrigin: 'top left',
            // Simple grid background for texture
            background: scale > 0.4 ? 'radial-gradient(circle, rgba(30, 63, 32, 0.05) 1px, transparent 1px)' : 'none',
            backgroundSize: `${30 * scale}px ${30 * scale}px`,
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
            {relationships.map((rel) => {
              const p1 = people.find((p) => p.id === rel.personId1);
              const p2 = people.find((p) => p.id === rel.personId2);
              if (!p1 || !p2) return null;

              if (rel.type === 'spouse') {
                // Horizontal link between spouses
                // Draw line between the closest horizontal edges of the cards
                const leftNode = p1.x < p2.x ? p1 : p2;
                const rightNode = p1.x < p2.x ? p2 : p1;

                const startX = (leftNode.x + cardWidth) * scale;
                const startY = (leftNode.y + cardHeight / 2) * scale;
                const endX = rightNode.x * scale;
                const endY = (rightNode.y + cardHeight / 2) * scale;

                return (
                  <path
                    key={`rel-${rel.id}`}
                    d={`M ${startX} ${startY} H ${endX}`}
                    stroke="#1E3F20"
                    strokeWidth={2 * scale}
                    strokeDasharray={`${4 * scale}, ${4 * scale}`} // Dotted line for spousal marriages
                    fill="none"
                  />
                );
              }

              if (rel.type === 'parent-child') {
                // Parent-Child connection: Orthogonal layout drops
                // p1 is parent (top), p2 is child (bottom)
                const startX = (p1.x + cardWidth / 2) * scale;
                const startY = (p1.y + cardHeight) * scale;
                const endX = (p2.x + cardWidth / 2) * scale;
                const endY = p2.y * scale;

                // Vertical drop midpoint
                const midY = startY + 40 * scale;

                return (
                  <path
                    key={`rel-${rel.id}`}
                    d={`M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`}
                    stroke="#1E3F20"
                    strokeWidth={1.5 * scale}
                    fill="none"
                  />
                );
              }

              return null;
            })}
          </svg>

          {/* Cards Layer */}
          {people.map((person) => {
            const isSelected = selectedPersonId === person.id;
            const fullName = `${person.firstName} ${person.lastName || ''}`;

            return (
              <Card
                key={person.id}
                onClick={() => onSelectPerson(person)}
                sx={{
                  position: 'absolute',
                  left: person.x * scale,
                  top: person.y * scale,
                  width: cardWidth * scale,
                  height: cardHeight * scale,
                  cursor: 'pointer',
                  border: isSelected ? `${2 * scale}px solid` : `${1 * scale}px solid`,
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  zIndex: isSelected ? 5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    borderColor: isSelected ? 'primary.main' : 'rgba(30, 63, 32, 0.3)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 1.5 * scale,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5 * scale,
                    width: '100%',
                    '&:last-child': { pb: 1.5 * scale },
                  }}
                >
                  <Avatar
                    src={person.photoUrl || undefined}
                    alt={fullName}
                    sx={{ width: 44 * scale, height: 44 * scale }}
                  >
                    {person.firstName[0]}
                  </Avatar>
                  <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 'bold', fontSize: `${0.875 * scale}rem` }}
                    >
                      {fullName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: `${0.75 * scale}rem`, display: 'block' }}
                    >
                      {person.birthDate.split(',')[1]?.trim() || person.birthDate} – {person.deathDate ? person.deathDate.split(',')[1]?.trim() : 'Present'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
