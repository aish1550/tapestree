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

    // 3. Fetch ALL people in the tree
    const allPeople = await prisma.person.findMany({
      where: { treeId: tree.id },
    });

    // 4. Fetch ALL relationships in the tree
    const allRelationships = await prisma.relationship.findMany({
      where: { treeId: tree.id },
    });

    return NextResponse.json({
      treeId: tree.id,
      treeName: tree.name,
      focusPerson,
      people: allPeople,
      relationships: allRelationships,
    });
  } catch (error: any) {
    console.error('Error fetching tree data:', error);
    return NextResponse.json({ error: 'Server error fetching tree data', details: error.message }, { status: 500 });
  }
}
