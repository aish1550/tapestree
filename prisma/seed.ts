import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

interface TempPerson {
  tempId: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  birthDate: Date;
  birthPlace: string;
  deathDate: Date | null;
  photoUrl: string;
  bio: string;
  x: number;
  y: number;
  dbId?: string; // Will hold the created database UUID
}

interface TempRelationship {
  personId1: string; // Parent or Spouse 1 (tempId)
  personId2: string; // Child or Spouse 2 (tempId)
  type: 'parent-child' | 'spouse';
}

async function main() {
  console.log('Clearing database...');
  await prisma.promptResponse.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.event.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatMember.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.person.deleteMany();
  await prisma.treeCollaborator.deleteMany();
  await prisma.tree.deleteMany();
  await prisma.account.deleteMany();

  console.log('Creating owner account...');
  const owner = await prisma.account.create({
    data: {
      email: 'owner@tapestree.app',
      fullName: 'Sarah Jenkins',
      tier: 'premium',
    },
  });

  const collaboratorAccount = await prisma.account.create({
    data: {
      email: 'cousin.rob@tapestree.app',
      fullName: 'Robert Davis',
      tier: 'free',
    },
  });

  console.log('Creating family tree...');
  const tree = await prisma.tree.create({
    data: {
      name: 'The Jenkins-Dupont Tapestree',
      ownerId: owner.id,
    },
  });

  // Link collaborator
  await prisma.treeCollaborator.create({
    data: {
      treeId: tree.id,
      accountId: collaboratorAccount.id,
      role: 'editor',
    },
  });

  console.log('Simulating 500+ member family graph...');
  
  const peopleList: TempPerson[] = [];
  const relationshipsList: TempRelationship[] = [];
  let tempIdCounter = 0;

  const nextTempId = () => `p_${++tempIdCounter}`;

  // Avatar photos lists
  const maleAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120&h=120',
  ];

  const femaleAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
  ];

  // Generation tracker
  let currentGenerationNodes: TempPerson[] = [];
  const TARGET_SIZE = 550;

  // Generation 0: The Founders (Great-Great-Great Grandparents)
  // Born around 1830
  const gen0Father: TempPerson = {
    tempId: nextTempId(),
    firstName: faker.person.firstName('male'),
    lastName: 'Jenkins',
    gender: 'male',
    birthDate: new Date('1832-04-12'),
    birthPlace: 'London, UK',
    deathDate: new Date('1905-11-20'),
    photoUrl: maleAvatars[0],
    bio: 'Family founder. Emigrated from London. Operated a farm and taught woodcraft.',
    x: 200,
    y: 100,
  };

  const gen0Mother: TempPerson = {
    tempId: nextTempId(),
    firstName: faker.person.firstName('female'),
    lastName: faker.person.lastName(), // Maiden name
    gender: 'female',
    birthDate: new Date('1836-09-02'),
    birthPlace: 'Boston, MA',
    deathDate: new Date('1912-03-14'),
    photoUrl: femaleAvatars[0],
    bio: 'Founding matriarch. Noted seamstress and local teacher.',
    x: 460,
    y: 100,
  };

  peopleList.push(gen0Father, gen0Mother);
  relationshipsList.push({
    personId1: gen0Father.tempId,
    personId2: gen0Mother.tempId,
    type: 'spouse',
  });

  currentGenerationNodes.push(gen0Father, gen0Mother);

  // Generation Index
  let genIndex = 1;
  const genXTracker = new Map<number, number>();

  // Generational simulation loop
  while (peopleList.length < TARGET_SIZE) {
    const nextGenNodes: TempPerson[] = [];
    const couples: [TempPerson, TempPerson][] = [];

    // Group the current generation into couples (if married)
    for (let i = 0; i < currentGenerationNodes.length; i++) {
      const p = currentGenerationNodes[i];
      // Find if this person is married
      const rel = relationshipsList.find(
        (r) => r.type === 'spouse' && (r.personId1 === p.tempId || r.personId2 === p.tempId)
      );
      if (rel) {
        const spouseId = rel.personId1 === p.tempId ? rel.personId2 : rel.personId1;
        const spouse = peopleList.find((x) => x.tempId === spouseId);
        if (spouse && !couples.some(([a, b]) => a.tempId === p.tempId || b.tempId === p.tempId)) {
          couples.push([p, spouse]);
        }
      }
    }

    // Each couple has children
    const meanBirthYear = 1830 + genIndex * 28;

    for (const [father, mother] of couples) {
      // Determine number of children (average 2 to 4)
      const numChildren = faker.number.int({ min: 2, max: 4 });

      for (let c = 0; c < numChildren; c++) {
        if (peopleList.length >= TARGET_SIZE) break;

        const childGender = faker.helpers.arrayElement(['male', 'female'] as const);
        const childBirthYear = meanBirthYear + faker.number.int({ min: -4, max: 4 });
        
        // Ensure child is born after mother is at least 18
        const motherBirthYear = mother.birthDate.getFullYear();
        const finalBirthYear = Math.max(childBirthYear, motherBirthYear + 18);

        const currentX = genXTracker.get(genIndex) || 50;

        const child: TempPerson = {
          tempId: nextTempId(),
          firstName: faker.person.firstName(childGender),
          lastName: father.lastName, // Children inherit father's surname
          gender: childGender,
          birthDate: new Date(`${finalBirthYear}-06-15`),
          birthPlace: faker.helpers.arrayElement(['London, UK', 'New York, NY', 'Boston, MA', 'San Francisco, CA']),
          deathDate: finalBirthYear < 1930 ? new Date(`${finalBirthYear + faker.number.int({ min: 60, max: 90 })}-08-10`) : null,
          photoUrl: childGender === 'male' ? faker.helpers.arrayElement(maleAvatars) : faker.helpers.arrayElement(femaleAvatars),
          bio: faker.lorem.paragraph(),
          x: currentX,
          y: genIndex * 240 + 100,
        };

        genXTracker.set(genIndex, currentX + 280);

        peopleList.push(child);
        nextGenNodes.push(child);

        // Add parent-child relationships
        relationshipsList.push({
          personId1: father.tempId,
          personId2: child.tempId,
          type: 'parent-child',
        });
        relationshipsList.push({
          personId1: mother.tempId,
          personId2: child.tempId,
          type: 'parent-child',
        });

        // If this child grows up, marry a spouse from outside the family
        if (peopleList.length < TARGET_SIZE && finalBirthYear < 2010) {
          const spouseGender = childGender === 'male' ? 'female' : 'male';
          const spouseBirthYear = finalBirthYear + faker.number.int({ min: -3, max: 3 });

          const spouse: TempPerson = {
            tempId: nextTempId(),
            firstName: faker.person.firstName(spouseGender),
            lastName: spouseGender === 'female' ? faker.person.lastName() : child.lastName, // If male, keep their name
            gender: spouseGender,
            birthDate: new Date(`${spouseBirthYear}-03-20`),
            birthPlace: faker.helpers.arrayElement(['Chicago, IL', 'Los Angeles, CA', 'Seattle, WA', 'London, UK']),
            deathDate: spouseBirthYear < 1930 ? new Date(`${spouseBirthYear + faker.number.int({ min: 60, max: 90 })}-04-05`) : null,
            photoUrl: spouseGender === 'male' ? faker.helpers.arrayElement(maleAvatars) : faker.helpers.arrayElement(femaleAvatars),
            bio: faker.lorem.paragraph(),
            x: child.x + 240,
            y: child.y,
          };

          genXTracker.set(genIndex, child.x + 560);

          peopleList.push(spouse);
          
          // Connect spouse
          relationshipsList.push({
            personId1: child.tempId,
            personId2: spouse.tempId,
            type: 'spouse',
          });
        }
      }
    }

    if (nextGenNodes.length === 0) break;
    currentGenerationNodes = nextGenNodes;
    genIndex++;
  }

  console.log(`Generated local tree cache with ${peopleList.length} members.`);

  // Write people nodes to the database
  console.log('Inserting members into the database...');
  for (const tp of peopleList) {
    const dbPerson = await prisma.person.create({
      data: {
        treeId: tree.id,
        firstName: tp.firstName,
        lastName: tp.lastName,
        birthDate: tp.birthDate,
        birthPlace: tp.birthPlace,
        deathDate: tp.deathDate,
        photoUrl: tp.photoUrl,
        bio: tp.bio,
        x: tp.x,
        y: tp.y,
        isRemembranceNode: false,
      },
    });
    tp.dbId = dbPerson.id; // Map tempId to actual DB UUID
  }

  console.log('Inserting relationships into the database...');
  for (const tr of relationshipsList) {
    const p1 = peopleList.find((x) => x.tempId === tr.personId1);
    const p2 = peopleList.find((x) => x.tempId === tr.personId2);

    if (p1?.dbId && p2?.dbId) {
      await prisma.relationship.create({
        data: {
          treeId: tree.id,
          personId1: p1.dbId,
          personId2: p2.dbId,
          type: tr.type,
        },
      });
    }
  }

  console.log('Populating social chats and message logs...');
  const chat = await prisma.chat.create({
    data: {
      treeId: tree.id,
      name: 'Global Family Lounge',
    },
  });

  // Link chat members
  await prisma.chatMember.createMany({
    data: [
      { chatId: chat.id, accountId: owner.id },
      { chatId: chat.id, accountId: collaboratorAccount.id },
    ],
  });

  // Generate 60+ messages to simulate history
  const messageData = [];
  for (let i = 0; i < 65; i++) {
    const isOwner = faker.datatype.boolean();
    messageData.push({
      chatId: chat.id,
      senderId: isOwner ? owner.id : collaboratorAccount.id,
      content: faker.helpers.arrayElement([
        'Look at this old photo I found of Great Grandfather!',
        'Does anyone remember the name of Aunt Sarah\'s second husband?',
        'Happy Birthday to cousin Liam!',
        'Thanks for updating the tree!',
        faker.lorem.sentence(),
      ]),
      createdAt: faker.date.recent({ days: 30 }),
    });
  }
  await prisma.message.createMany({ data: messageData });

  console.log('Populating family calendar events...');
  const eventsData = [
    {
      treeId: tree.id,
      title: 'Jenkins Annual Summer Reunion',
      description: 'The annual picnic gathering at Golden Gate Park.',
      eventDate: new Date('2026-08-15T12:00:00Z'),
      type: 'reunion',
    },
    {
      treeId: tree.id,
      title: "Sarah Jenkins' Birthday Celebration",
      description: 'Joint dinner party.',
      eventDate: new Date('2026-09-23T18:00:00Z'),
      type: 'birthday',
    },
    {
      treeId: tree.id,
      title: 'In Memory of Great Grandfather George',
      description: 'Remembrance service.',
      eventDate: new Date('2026-11-20T10:00:00Z'),
      type: 'remembrance',
    },
  ];
  await prisma.event.createMany({ data: eventsData });

  console.log('Database seeding successfully complete.');
  console.log(`Summary:`);
  console.log(`- Accounts created: 2`);
  console.log(`- Family Trees created: 1`);
  console.log(`- Family Members created: ${peopleList.length}`);
  console.log(`- Relationship Edges created: ${relationshipsList.length}`);
  console.log(`- Message logs seeded: ${messageData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
