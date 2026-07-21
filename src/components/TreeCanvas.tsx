'use client';
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
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
  const { setViewport } = useReactFlow();
  const viewportRef = useRef<HTMLDivElement>(null);

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

  // 3. Zoom and pan camera-centering transition when selectedPersonId changes
  useEffect(() => {
    if (!selectedPersonId || !viewportRef.current) return;
    const person = people.find((p) => p.id === selectedPersonId);
    if (!person) return;

    const W = viewportRef.current.clientWidth;
    const H = viewportRef.current.clientHeight;

    const scale = 1.2; // Capped max zoom target
    const targetX = W / 2 - (person.x + cardWidth / 2) * scale;
    const targetY = H / 2 - (person.y + cardHeight / 2) * scale;

    setViewport({ x: targetX, y: targetY, zoom: scale }, { duration: 450 });
  }, [selectedPersonId, people, setViewport]);

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
      }
    }
  }, [people, setViewport]);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    const person = people.find((p) => p.id === node.id);
    if (person) {
      onSelectPerson(person);
    }
  };

  return (
    <Box
      ref={viewportRef}
      sx={{
        flexGrow: 1,
        height: 'calc(100vh - 64px)',
        width: '100%',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        minZoom={0.3}
        maxZoom={1.2}
        fitViewOptions={{ padding: 0.2 }}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        panOnDrag={true}
        preventScrolling={true}
        nodesDraggable={false} // Retain fixed pre-calculated coordinates layout
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background variant={BackgroundVariant.Dots} gap={40} size={1} color="#1E3F20" style={{ opacity: 0.15 }} />
        <Controls showInteractive={false} position="bottom-left" style={{ margin: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
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
