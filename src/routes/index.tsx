import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { Box, Typography } from '@mui/material';
import Sidebar from '../components/Sidebar';
import TreeCanvas, { Person } from '../components/TreeCanvas';
import Inspector from '../components/Inspector';
import { prisma } from '../../lib/db';

const getTreeData = createServerFn({ method: 'GET' })
  .handler(async () => {
    // 1. Get the default tree
    const tree = await prisma.tree.findFirst({
      select: { id: true, name: true },
    });

    if (!tree) {
      throw new Error('No family tree found in database. Please run seed script.');
    }

    // 2. Identify the focused person
    const focusPerson = await prisma.person.findFirst({
      where: { treeId: tree.id },
      orderBy: { birthDate: 'asc' },
    });

    if (!focusPerson) {
      throw new Error('Focused person not found');
    }

    // 3. Fetch ALL people in the tree
    const allPeople = await prisma.person.findMany({
      where: { treeId: tree.id },
    });

    // 4. Fetch ALL relationships in the tree
    const allRelationships = await prisma.relationship.findMany({
      where: { treeId: tree.id },
    });

    // Format birthDate/deathDate strings and map spouse names on the server
    const formattedPeople = allPeople.map((p) => {
      const spouseRel = allRelationships.find((r) => 
        r.type === 'spouse' && (r.personId1 === p.id || r.personId2 === p.id)
      );
      let spouseName = 'None';
      if (spouseRel) {
        const spouseId = spouseRel.personId1 === p.id ? spouseRel.personId2 : spouseRel.personId1;
        const spouseObj = allPeople.find((x) => x.id === spouseId);
        if (spouseObj) {
          spouseName = `${spouseObj.firstName} ${spouseObj.lastName || ''}`;
        }
      }

      return {
        ...p,
        spouse: spouseName,
        birthDate: p.birthDate ? new Date(p.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown',
        deathDate: p.deathDate ? new Date(p.deathDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null,
      };
    });

    return {
      treeId: tree.id,
      treeName: tree.name,
      focusPerson: formattedPeople.find((x) => x.id === focusPerson.id) || formattedPeople[0],
      people: formattedPeople,
      relationships: allRelationships,
    };
  });

export const Route = createFileRoute('/')({
  loader: async () => {
    return getTreeData();
  },
  component: HomeComponent,
});

function HomeComponent() {
  const data = Route.useLoaderData();
  const [selectedPerson, setSelectedPerson] = useState<Person | undefined>(
    data.focusPerson ? (data.focusPerson as unknown as Person) : undefined
  );

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
            Family Tree: {data.treeName}
          </Typography>
        </Box>

        {/* Tree Canvas */}
        <TreeCanvas
          people={data.people as unknown as Person[]}
          relationships={data.relationships}
          selectedPersonId={selectedPerson?.id}
          onSelectPerson={(person) => setSelectedPerson(person)}
        />
      </Box>

      {/* 3. Context Inspector panel on the right */}
      <Inspector
        person={selectedPerson}
        onClose={() => setSelectedPerson(undefined)}
      />
    </Box>
  );
}
