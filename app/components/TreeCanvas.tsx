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
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Drag offsets
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const cardWidth = 220;
  const cardHeight = 76;
  const scale = zoom / 100;

  // 1. Center the view on selected node
  const centerOnNode = (personId: string, smooth = true) => {
    const person = people.find((p) => p.id === personId);
    if (!person || !viewportRef.current) return;

    const W = viewportRef.current.clientWidth;
    const H = viewportRef.current.clientHeight;

    const targetX = W / 2 - (person.x + cardWidth / 2) * scale;
    const targetY = H / 2 - (person.y + cardHeight / 2) * scale;

    setPanX(targetX);
    setPanY(targetY);
  };

  // Trigger centering when selected person changes
  useEffect(() => {
    if (selectedPersonId) {
      centerOnNode(selectedPersonId, true);
    }
  }, [selectedPersonId]);

  // Center on oldest founder on initial mount
  useEffect(() => {
    if (people.length > 0 && !selectedPersonId) {
      const founder = people.reduce((oldest, current) => {
        const oldestDate = new Date(oldest.birthDate).getTime();
        const currentDate = new Date(current.birthDate).getTime();
        return currentDate < oldestDate ? current : oldest;
      }, people[0]);
      if (founder) {
        centerOnNode(founder.id, false);
      }
    }
  }, [people]);

  // 2. Zoom centered on viewport midpoint
  const handleZoom = (newZoom: number) => {
    if (!viewportRef.current) return;
    const W = viewportRef.current.clientWidth;
    const H = viewportRef.current.clientHeight;
    const s1 = scale;
    const s2 = newZoom / 100;

    // Point in canvas space at screen center
    const canvasCenterX = (W / 2 - panX) / s1;
    const canvasCenterY = (H / 2 - panY) / s1;

    setZoom(newZoom);
    setPanX(W / 2 - canvasCenterX * s2);
    setPanY(H / 2 - canvasCenterY * s2);
  };

  const handleZoomIn = () => handleZoom(Math.min(zoom + 10, 150));
  const handleZoomOut = () => handleZoom(Math.max(zoom - 10, 30));
  const handleResetZoom = () => {
    setZoom(100);
    if (selectedPersonId) {
      centerOnNode(selectedPersonId, true);
    } else if (people.length > 0) {
      const founder = people[0];
      centerOnNode(founder.id, true);
    }
  };

  // 3. Trackpad/Mouse Wheel Panning & Zooming (Figma Style)
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zooming (pinch to zoom)
        const zoomFactor = e.deltaY < 0 ? 5 : -5;
        const nextZoom = Math.max(30, Math.min(150, zoom + zoomFactor));
        
        // Calculate new scale center
        const W = viewport.clientWidth;
        const H = viewport.clientHeight;
        const s1 = zoom / 100;
        const s2 = nextZoom / 100;
        const canvasCenterX = (W / 2 - panX) / s1;
        const canvasCenterY = (H / 2 - panY) / s1;

        setZoom(nextZoom);
        setPanX(W / 2 - canvasCenterX * s2);
        setPanY(H / 2 - canvasCenterY * s2);
      } else {
        // Free panning via scroll wheel / trackpad swipe
        setPanX((prev) => prev - e.deltaX);
        setPanY((prev) => prev - e.deltaY);
      }
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', onWheel);
    };
  }, [zoom, panX, panY]);

  // 4. Mouse Drag-to-Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only pan on left click
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panX, y: panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(panStartRef.current.x + dx);
    setPanY(panStartRef.current.y + dy);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
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

      {/* Figma Infinite Viewport Frame */}
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
          overflow: 'hidden', // Hide standard browser scrollbars
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {/* Figma Infinite Translation Canvas */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
            transformOrigin: '0 0',
            // Smooth transitions only when the user is NOT dragging (e.g. during click-to-center zoom)
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            // Figma Grid background texture
            background: zoom > 35 ? 'radial-gradient(circle, rgba(30, 63, 32, 0.08) 1px, transparent 1px)' : 'none',
            backgroundSize: '30px 30px',
          }}
        >
          {/* SVG Connections */}
          <svg
            style={{
              position: 'absolute',
              width: '10000px', // Canvas spans deep
              height: '10000px',
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
                const leftNode = p1.x < p2.x ? p1 : p2;
                const rightNode = p1.x < p2.x ? p2 : p1;

                const startX = leftNode.x + cardWidth;
                const startY = leftNode.y + cardHeight / 2;
                const endX = rightNode.x;
                const endY = rightNode.y + cardHeight / 2;

                return (
                  <path
                    key={`rel-${rel.id}`}
                    d={`M ${startX} ${startY} H ${endX}`}
                    stroke="#1E3F20"
                    strokeWidth={2}
                    strokeDasharray="4, 4"
                    fill="none"
                  />
                );
              }

              if (rel.type === 'parent-child') {
                const startX = p1.x + cardWidth / 2;
                const startY = p1.y + cardHeight;
                const endX = p2.x + cardWidth / 2;
                const endY = p2.y;

                const midY = startY + 30;

                return (
                  <path
                    key={`rel-${rel.id}`}
                    d={`M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`}
                    stroke="#1E3F20"
                    strokeWidth={1.5}
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
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering background pan clicks
                  onSelectPerson(person);
                }}
                sx={{
                  position: 'absolute',
                  left: person.x,
                  top: person.y,
                  width: cardWidth,
                  height: cardHeight,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid' : '1px solid',
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
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    width: '100%',
                    '&:last-child': { pb: 1.5 },
                  }}
                >
                  <Avatar
                    src={person.photoUrl || undefined}
                    alt={fullName}
                    sx={{ width: 44, height: 44 }}
                  >
                    {person.firstName[0]}
                  </Avatar>
                  <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 'bold' }}
                    >
                      {fullName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
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
