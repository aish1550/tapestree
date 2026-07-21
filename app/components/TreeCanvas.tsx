'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useReactFlow,
  Node,
  Edge,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FamilyNode, { Person } from './FamilyNode';

export type { Person };

interface TreeCanvasProps {
  people: Person[];
  relationships: any[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

const nodeTypes = {
  familyNode: FamilyNode,
};

function TreeCanvasInner({ people, relationships, onSelectPerson, selectedPersonId }: TreeCanvasProps) {
  const { setViewport, zoomIn, zoomOut } = useReactFlow();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentZoom, setCurrentZoom] = useState(100);

  const cardWidth = 220;
  const cardHeight = 76;

  // 1. Map database people to React Flow Node structures
  const nodes: Node[] = people.map((p) => ({
    id: p.id,
    type: 'familyNode',
    position: { x: p.x, y: p.y },
    data: { person: p },
    selected: selectedPersonId === p.id,
  }));

  // 2. Map database relationships to React Flow Edge structures
  const edges: Edge[] = relationships.map((rel) => {
    const p1 = people.find((x) => x.id === rel.personId1);
    const p2 = people.find((x) => x.id === rel.personId2);
    
    let source = rel.personId1;
    let target = rel.personId2;
    let sourceHandle = 'child-bottom';
    let targetHandle = undefined;
    let edgeType = 'step'; // 90-degree orthogonal line
    
    const edgeStyle: React.CSSProperties = {
      stroke: '#1E3F20',
      strokeWidth: 1.5,
    };

    if (rel.type === 'spouse' && p1 && p2) {
      edgeType = 'straight';
      edgeStyle.strokeDasharray = '4, 4'; // Dotted line for spouses
      edgeStyle.strokeWidth = 2;
      
      if (p1.x < p2.x) {
        source = p1.id;
        target = p2.id;
        sourceHandle = 'spouse-right';
        targetHandle = 'spouse-left';
      } else {
        source = p2.id;
        target = p1.id;
        sourceHandle = 'spouse-right';
        targetHandle = 'spouse-left';
      }
    }

    return {
      id: `edge-${rel.id}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: edgeType,
      style: edgeStyle,
    };
  });

  // Helper centering function
  const centerOnNode = (personId: string, smooth = true) => {
    if (!viewportRef.current) return;
    const person = people.find((p) => p.id === personId);
    if (!person) return;

    const W = viewportRef.current.clientWidth;
    const H = viewportRef.current.clientHeight;

    const scale = 1.2; // 120% Capped Max Zoom
    const targetX = W / 2 - (person.x + cardWidth / 2) * scale;
    const targetY = H / 2 - (person.y + cardHeight / 2) * scale;

    if (smooth) {
      setViewport({ x: targetX, y: targetY, zoom: scale }, { duration: 400 });
    } else {
      setViewport({ x: targetX, y: targetY, zoom: scale });
    }
    setCurrentZoom(120);
  };

  // 3. Zoom and pan camera-centering transition when selectedPersonId changes
  useEffect(() => {
    if (selectedPersonId) {
      centerOnNode(selectedPersonId, true);
    }
  }, [selectedPersonId]);

  // 4. Center on oldest founder on initial mount
  useEffect(() => {
    if (people.length > 0 && !selectedPersonId && viewportRef.current) {
      const founder = people.reduce((oldest, current) => {
        const oldestDate = new Date(oldest.birthDate).getTime();
        const currentDate = new Date(current.birthDate).getTime();
        return currentDate < oldestDate ? current : oldest;
      }, people[0]);

      if (founder) {
        const W = viewportRef.current.clientWidth;
        const H = viewportRef.current.clientHeight;
        const scale = 1.0;
        const targetX = W / 2 - (founder.x + cardWidth / 2) * scale;
        const targetY = H / 2 - (founder.y + cardHeight / 2) * scale;
        setViewport({ x: targetX, y: targetY, zoom: scale });
        setCurrentZoom(100);
      }
    }
  }, [people]);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    const person = people.find((p) => p.id === node.id);
    if (person) {
      onSelectPerson(person);
    }
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  const handleResetZoom = () => {
    if (selectedPersonId) {
      centerOnNode(selectedPersonId, true);
    } else if (people.length > 0) {
      const founder = people.reduce((oldest, current) => {
        const oldestDate = new Date(oldest.birthDate).getTime();
        const currentDate = new Date(current.birthDate).getTime();
        return currentDate < oldestDate ? current : oldest;
      }, people[0]);
      if (founder) {
        centerOnNode(founder.id, true);
      }
    }
  };

  // Sync zoom percentage state on viewport moves
  const handleMove = (_event: any, viewport: any) => {
    setCurrentZoom(Math.round(viewport.zoom * 100));
  };

  return (
    <Box
      ref={viewportRef}
      sx={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      {/* Custom Sleek Zoom Controls */}
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
            {currentZoom}%
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleZoomIn}>
          <ZoomInIcon />
        </IconButton>
        <IconButton size="small" onClick={handleResetZoom}>
          <CenterFocusWeakIcon />
        </IconButton>
      </Box>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onMove={handleMove}
        minZoom={0.3}
        maxZoom={1.2}
        fitViewOptions={{ padding: 0.2 }}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        panOnDrag={true}
        preventScrolling={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background variant={BackgroundVariant.Dots} gap={40} size={1} color="#1E3F20" style={{ opacity: 0.15 }} />
        <MiniMap zoomable pannable style={{ borderRadius: '8px', border: '1px solid #e0e0e0', margin: '16px' }} />
      </ReactFlow>
    </Box>
  );
}

export default function TreeCanvas(props: TreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <TreeCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
