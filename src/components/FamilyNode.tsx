'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';

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

interface FamilyNodeProps {
  data: {
    person: Person;
  };
  selected?: boolean;
}

export default function FamilyNode({ data, selected }: FamilyNodeProps) {
  const person = data.person;
  const fullName = `${person.firstName} ${person.lastName || ''}`;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Top Handle: Input from parents */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#1E3F20', width: 8, height: 8, border: '1px solid #FAF6EE' }}
      />

      {/* Left Handle: Spousal connection */}
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-left"
        style={{ background: '#1E3F20', width: 6, height: 6, top: '50%', border: '1px solid #FAF6EE' }}
      />

      <Card
        sx={{
          width: 220,
          height: 76,
          border: selected ? '2px solid' : '1px solid',
          borderColor: selected ? 'primary.main' : 'transparent',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            borderColor: selected ? 'primary.main' : 'rgba(30, 63, 32, 0.3)',
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

      {/* Right Handle: Spousal connection */}
      <Handle
        type="source"
        position={Position.Right}
        id="spouse-right"
        style={{ background: '#1E3F20', width: 6, height: 6, top: '50%', border: '1px solid #FAF6EE' }}
      />

      {/* Bottom Handle: Output to children */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="child-bottom"
        style={{ background: '#1E3F20', width: 8, height: 8, border: '1px solid #FAF6EE' }}
      />
    </Box>
  );
}
