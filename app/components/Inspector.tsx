'use client';
import React from 'react';
import { Box, Typography, Avatar, Button, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Person } from './TreeCanvas';

interface InspectorProps {
  person?: Person;
  onClose?: () => void;
}

export default function Inspector({ person, onClose }: InspectorProps) {
  if (!person) {
    return (
      <Box
        sx={{
          width: 320,
          height: '100vh',
          bgcolor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          Select a family member on the canvas to view their profile, stories, and records.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 320,
        height: '100vh',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          Edit Profile
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Hero profile section */}
      {(() => {
        const fullName = `${person.firstName} ${person.lastName || ''}`;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pb: 3, pt: 1 }}>
            <Avatar
              src={person.photoUrl || undefined}
              alt={fullName}
              sx={{ width: 100, height: 100, mb: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
              {fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              b. {person.birthDate.split(',')[1]?.trim() || '1985'} – Present
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Born in {person.birthPlace}
            </Typography>
          </Box>
        );
      })()}

      <Divider />

      {/* Relationships */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1.5 }}>
          Relationships
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Spouse:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {person.spouse || 'None'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Children:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {person.id === '1' || person.id === '2' ? 'Liam, Sophie' : 'Alexander'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Life Events / Timeline */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1.5 }}>
          Life Events
        </Typography>
        <List disablePadding>
          <ListItem disableGutters sx={{ alignItems: 'flex-start', mb: 1.5 }}>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Birth
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {person.birthDate} • {person.birthPlace}
                </Typography>
              }
            />
          </ListItem>
          {person.id === '1' && (
            <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Marriage
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    July 9, 2003 • San Francisco, CA
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Box>

      <Divider />

      {/* Notes / Narrative */}
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
          Biography Notes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {person.bio || 'No biography written yet. Click Edit Profile to add their life story.'}
        </Typography>
      </Box>

      <Divider />

      {/* Action Buttons */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button variant="contained" color="primary" startIcon={<EditIcon />} fullWidth>
          Save Changes
        </Button>
        <Button variant="outlined" color="primary" startIcon={<PhotoCameraIcon />} fullWidth>
          Add Media
        </Button>
        <Button variant="text" color="primary" startIcon={<MenuBookIcon />} fullWidth>
          View Records
        </Button>
      </Box>
    </Box>
  );
}
