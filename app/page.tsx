'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Sidebar from './components/Sidebar';
import TreeCanvas, { Person } from './components/TreeCanvas';
import Inspector from './components/Inspector';

export default function Home() {
  const [focusPersonId, setFocusPersonId] = useState<string | undefined>(undefined);
  const [treeData, setTreeData] = useState<{ treeName: string; people: Person[]; relationships: any[] } | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch Tree Data whenever focused member changes
  useEffect(() => {
    async function fetchTree() {
      try {
        setLoading(true);
        const url = focusPersonId ? `/api/tree?focus=${focusPersonId}` : '/api/tree';
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          // Format birthDate/deathDate strings and map spouse names
          const formattedPeople = data.people.map((p: any) => {
            const spouseRel = data.relationships.find((r: any) => 
              r.type === 'spouse' && (r.personId1 === p.id || r.personId2 === p.id)
            );
            let spouseName = 'None';
            if (spouseRel) {
              const spouseId = spouseRel.personId1 === p.id ? spouseRel.personId2 : spouseRel.personId1;
              const spouseObj = data.people.find((x: any) => x.id === spouseId);
              if (spouseObj) {
                spouseName = `${spouseObj.firstName} ${spouseObj.lastName || ''}`;
              }
            }

            return {
              ...p,
              spouse: spouseName,
              birthDate: p.birthDate ? new Date(p.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown',
              deathDate: p.deathDate ? new Date(p.deathDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
            };
          });

          // Compute spouse name for the focused person as well
          let focusSpouseName = 'None';
          if (data.focusPerson) {
            const focusSpouseRel = data.relationships.find((r: any) => 
              r.type === 'spouse' && (r.personId1 === data.focusPerson.id || r.personId2 === data.focusPerson.id)
            );
            if (focusSpouseRel) {
              const spouseId = focusSpouseRel.personId1 === data.focusPerson.id ? focusSpouseRel.personId2 : focusSpouseRel.personId1;
              const spouseObj = data.people.find((x: any) => x.id === spouseId);
              if (spouseObj) {
                focusSpouseName = `${spouseObj.firstName} ${spouseObj.lastName || ''}`;
              }
            }
          }

          const formattedFocusPerson = data.focusPerson ? {
            ...data.focusPerson,
            spouse: focusSpouseName,
            birthDate: data.focusPerson.birthDate ? new Date(data.focusPerson.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown',
            deathDate: data.focusPerson.deathDate ? new Date(data.focusPerson.deathDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
          } : undefined;

          setTreeData({
            treeName: data.treeName,
            people: formattedPeople,
            relationships: data.relationships,
          });
          setSelectedPerson(formattedFocusPerson);
        } else {
          console.error('API Error:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch tree:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTree();
  }, [focusPersonId]);

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Left Sidebar Navigation */}
      <Sidebar />

      {/* 2. Central Family Tree Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
        {/* Top Header Bar */}
        <Box
          sx={{
            height: 64,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            px: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {loading && !treeData ? 'Loading...' : `Family Tree: ${treeData?.treeName || 'Unspecified'}`}
          </Typography>
        </Box>

        {/* Tree Canvas */}
        {loading && !treeData ? (
          <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TreeCanvas
            people={treeData?.people || []}
            relationships={treeData?.relationships || []}
            selectedPersonId={selectedPerson?.id}
            onSelectPerson={(person) => {
              setSelectedPerson(person);
              // Refocus tree if clicking someone else
              if (person.id !== focusPersonId) {
                setFocusPersonId(person.id);
              }
            }}
          />
        )}
      </Box>

      {/* 3. Right Context Inspector */}
      <Inspector
        person={selectedPerson}
        onClose={() => setSelectedPerson(undefined)}
      />
    </Box>
  );
}
