import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const focusId = searchParams.get('focus');

    // 1. Get the default tree
    const tree = await prisma.tree.findFirst({
      select: { id: true, name: true },
    });

    if (!tree) {
      return NextResponse.json({ error: 'No family tree found in database. Please run seed script.' }, { status: 404 });
    }

    // 2. Identify the focused person
    let focusPerson = null;
    if (focusId) {
      focusPerson = await prisma.person.findUnique({
        where: { id: focusId },
      });
    } else {
      // Default to the oldest person in the tree (founder / root node)
      focusPerson = await prisma.person.findFirst({
        where: { treeId: tree.id },
        orderBy: { birthDate: 'asc' },
      });
    }

    if (!focusPerson) {
      return NextResponse.json({ error: 'Focused person not found' }, { status: 404 });
    }

    const focusPersonId = focusPerson.id;

    // 3. Find Spouse(s)
    const spouseRelations = await prisma.relationship.findMany({
      where: {
        treeId: tree.id,
        type: 'spouse',
        OR: [
          { personId1: focusPersonId },
          { personId2: focusPersonId },
        ],
      },
    });

    const spouseIds = spouseRelations.map(r => 
      r.personId1 === focusPersonId ? r.personId2 : r.personId1
    );

    const spouses = await prisma.person.findMany({
      where: { id: { in: spouseIds } },
    });

    // 4. Find Parents (Where focusPersonId is child (personId2))
    const parentRelations = await prisma.relationship.findMany({
      where: {
        treeId: tree.id,
        type: 'parent-child',
        personId2: focusPersonId,
      },
    });

    const parentIds = parentRelations.map(r => r.personId1);
    const parents = await prisma.person.findMany({
      where: { id: { in: parentIds } },
    });

    // 5. Find Children (Where focusPersonId is parent (personId1))
    const childRelations = await prisma.relationship.findMany({
      where: {
        treeId: tree.id,
        type: 'parent-child',
        personId1: focusPersonId,
      },
    });

    const childIds = childRelations.map(r => r.personId2);
    const children = await prisma.person.findMany({
      where: { id: { in: childIds } },
    });

    // 6. Gather all related people in a single list
    const peopleMap = new Map<string, any>();
    
    // Add focus person
    peopleMap.set(focusPerson.id, { ...focusPerson, role: 'focus' });
    
    // Add parents
    parents.forEach(p => peopleMap.set(p.id, { ...p, role: 'parent' }));
    
    // Add spouses
    spouses.forEach(s => peopleMap.set(s.id, { ...s, role: 'spouse' }));
    
    // Add children
    children.forEach(c => peopleMap.set(c.id, { ...c, role: 'child' }));

    const finalPeople = Array.from(peopleMap.values());

    // 7. Retrieve only relationships linking the loaded people
    const loadedPersonIds = finalPeople.map(p => p.id);

    const finalRelationships = await prisma.relationship.findMany({
      where: {
        treeId: tree.id,
        OR: [
          {
            personId1: { in: loadedPersonIds },
            personId2: { in: loadedPersonIds },
          },
        ],
      },
    });

    return NextResponse.json({
      treeId: tree.id,
      treeName: tree.name,
      focusPerson,
      people: finalPeople,
      relationships: finalRelationships,
    });
  } catch (error: any) {
    console.error('Error fetching tree data:', error);
    return NextResponse.json({ error: 'Server error fetching tree data', details: error.message }, { status: 500 });
  }
}
