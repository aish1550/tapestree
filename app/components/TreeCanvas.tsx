'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, IconButton, Skeleton } from '@mui/material';
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
  // 1. React Render Coordinates State (Throttled for Skeletons, does NOT block real-time dragging)
  const [renderPan, setRenderPan] = useState({ x: 0, y: 0, zoom: 100 });
  const [isDraggingState, setIsDraggingState] = useState(false);

  // 2. Uncontrolled DOM Refs for Panning & Zooming (GPU Accelerated, 60fps)
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const zoomRef = useRef(100);
  const isDraggingRef = useRef(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Drag offsets
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  
  // Throttling timers
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cardWidth = 220;
  const cardHeight = 76;
  const paddingRight = 600;
  const paddingBottom = 600;
  const maxX = Math.max(...people.map((p) => p.x), 1000) + paddingRight;
  const maxY = Math.max(...people.map((p) => p.y), 1000) + paddingBottom;

  // Direct DOM Transformer to bypass React lifecycle
  const updateCanvasDOMTransform = () => {
    if (canvasRef.current) {
      const scale = zoomRef.current / 100;
      canvasRef.current.style.transform = `translate3d(${panXRef.current}px, ${panYRef.current}px, 0) scale(${scale})`;
    }
  };

  // Throttle helper to update React render coordinates (updates offscreen skeletons in batches)
  const updateRenderPanThrottled = (x: number, y: number, z: number) => {
    if (throttleTimeoutRef.current) return;
    throttleTimeoutRef.current = setTimeout(() => {
      setRenderPan({ x, y, zoom: z });
      throttleTimeoutRef.current = null;
    }, 120); // Sync skeletons every 120ms (prevents lag, leaves GPU dragging completely free)
  };

  // 3. Center the view on selected node
  const centerOnNode = (personId: string, smooth = true) => {
    const person = people.find((p) => p.id === personId);
    if (!person || !viewportRef.current) return;

    const W = viewportRef.current.clientWidth;
    const H = viewportRef.current.clientHeight;

    const targetZoom = 120;
    const targetScale = targetZoom / 100;

    const targetX = W / 2 - (person.x + cardWidth / 2) * targetScale;
    const targetY = H / 2 - (person.y + cardHeight / 2) * targetScale;

    // Update Refs
    panXRef.current = targetX;
    panYRef.current = targetY;
    zoomRef.current = targetZoom;

    // Apply directly to DOM
    updateCanvasDOMTransform();

    // Immediately update React rendering state to force skeletons calculations
    setRenderPan({ x: targetX, y: targetY, zoom: targetZoom });
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

  // 4. Zoom handlers centered on viewport midpoint
  const handleZoom = (newZoom: number) => {
    if (!viewportRef.current) return;
    const W = viewportRef.current.clientWidth;
    const H = viewportRef.current.clientHeight;
    const s1 = zoomRef.current / 100;
    const s2 = newZoom / 100;

    const canvasCenterX = (W / 2 - panXRef.current) / s1;
    const canvasCenterY = (H / 2 - panYRef.current) / s1;

    panXRef.current = W / 2 - canvasCenterX * s2;
    panYRef.current = H / 2 - canvasCenterY * s2;
    zoomRef.current = newZoom;

    updateCanvasDOMTransform();
    setRenderPan({ x: panXRef.current, y: panYRef.current, zoom: newZoom });
  };

  const handleZoomIn = () => handleZoom(Math.min(zoomRef.current + 10, 150));
  const handleZoomOut = () => handleZoom(Math.max(zoomRef.current - 10, 30));
  const handleResetZoom = () => {
    if (selectedPersonId) {
      centerOnNode(selectedPersonId, true);
    } else if (people.length > 0) {
      const founder = people[0];
      centerOnNode(founder.id, true);
    }
  };

  // 5. Trackpad / Mouse Scroll Panning (Figma Style)
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zooming (pinch to zoom / mouse Cmd-scroll)
        const zoomFactor = e.metaKey ? (e.deltaY < 0 ? 15 : -15) : (e.deltaY < 0 ? 6 : -6);
        const nextZoom = Math.max(30, Math.min(150, zoomRef.current + zoomFactor));
        
        const W = viewport.clientWidth;
        const H = viewport.clientHeight;
        const s1 = zoomRef.current / 100;
        const s2 = nextZoom / 100;
        const canvasCenterX = (W / 2 - panXRef.current) / s1;
        const canvasCenterY = (H / 2 - panYRef.current) / s1;

        panXRef.current = W / 2 - canvasCenterX * s2;
        panYRef.current = H / 2 - canvasCenterY * s2;
        zoomRef.current = nextZoom;
      } else {
        // Panning (swipe/scroll)
        panXRef.current -= e.deltaX;
        panYRef.current -= e.deltaY;
      }

      // 60fps direct update
      updateCanvasDOMTransform();

      // Throttled React state update for skeletons
      updateRenderPanThrottled(panXRef.current, panYRef.current, zoomRef.current);

      // Final rest sync
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        setRenderPan({ x: panXRef.current, y: panYRef.current, zoom: zoomRef.current });
      }, 150);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', onWheel);
    };
  }, []);

  // 6. Mouse Drag-to-Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only pan on left click
    isDraggingRef.current = true;
    setIsDraggingState(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panXRef.current, y: panYRef.current };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    panXRef.current = panStartRef.current.x + dx;
    panYRef.current = panStartRef.current.y + dy;

    // 60fps direct update
    updateCanvasDOMTransform();

    // Throttled React state update
    updateRenderPanThrottled(panXRef.current, panYRef.current, zoomRef.current);
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDraggingState(false);
      // Final release sync
      setRenderPan({ x: panXRef.current, y: panYRef.current, zoom: zoomRef.current });
    }
  };

  // Render variables mapped from throttled render state
  const renderScale = renderPan.zoom / 100;
  const viewportWidth = viewportRef.current?.clientWidth || 800;
  const viewportHeight = viewportRef.current?.clientHeight || 600;

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
            {zoomRef.current}%
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleZoomIn}>
          <ZoomInIcon />
        </IconButton>
        <IconButton size="small" onClick={handleResetZoom}>
          <CenterFocusWeakIcon />
        </IconButton>
      </Box>

      {/* Viewport Frame */}
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
          overflow: 'hidden',
          cursor: isDraggingState ? 'grabbing' : 'grab',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {/* Figma Infinite GPU-Accelerated Canvas */}
        <Box
          ref={canvasRef}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            willChange: 'transform', // Promotes to hardware-composited GPU layer
            transformOrigin: '0 0',
            // CSS transition runs ONLY when user is NOT dragging (for click snap animations)
            transition: isDraggingState ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            background: zoomRef.current > 35 ? 'radial-gradient(circle, rgba(30, 63, 32, 0.08) 1px, transparent 1px)' : 'none',
            backgroundSize: '40px 40px',
          }}
        >
          {/* SVG Connections */}
          <svg
            style={{
              position: 'absolute',
              width: `${maxX}px`,
              height: `${maxY}px`,
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

                const midY = (startY + endY) / 2;

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

            // Calculate visibility using throttled render coordinates to prevent lag
            const tx = renderPan.x + person.x * renderScale;
            const ty = renderPan.y + person.y * renderScale;
            const isVisible = (
              tx + cardWidth * renderScale >= -150 &&
              tx <= viewportWidth + 150 &&
              ty + cardHeight * renderScale >= -150 &&
              ty <= viewportHeight + 150
            );

            return (
              <Card
                key={person.id}
                onClick={(e) => {
                  e.stopPropagation();
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
                  {isVisible ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <Skeleton variant="circular" width={44} height={44} animation="wave" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="80%" height={20} animation="wave" />
                        <Skeleton variant="text" width="50%" height={12} animation="wave" />
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
