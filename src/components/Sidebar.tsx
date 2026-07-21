'use client';
import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import ForestIcon from '@mui/icons-material/Forest';

interface SidebarProps {
  onAddClick?: () => void;
}

export default function Sidebar({ onAddClick }: SidebarProps) {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Family Tree', icon: <AccountTreeIcon />, active: true },
    { text: 'People', icon: <PeopleIcon /> },
    { text: 'Documents', icon: <DescriptionIcon /> },
    { text: 'Photos', icon: <PhotoLibraryIcon /> },
    { text: 'Research', icon: <SearchIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 3 }}>
        <ForestIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography
          variant="h5"
          color="primary"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}
        >
          Tapestree
        </Typography>
      </Box>

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={item.active}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(30, 63, 32, 0.08)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(30, 63, 32, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontWeight: item.active ? 600 : 500,
                      fontSize: '0.95rem',
                    }}
                  >
                    {item.text}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Add Family Member Button */}
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          sx={{
            py: 1.5,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#142c16',
              boxShadow: 'none',
            },
          }}
        >
          Add Family Member
        </Button>
      </Box>
    </Box>
  );
}
