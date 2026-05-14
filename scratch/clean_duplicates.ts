import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicates(eventId: string, fieldName: string) {
  console.log(`Cleaning duplicates for event ${eventId} based on field ${fieldName}...`);

  const guests = await prisma.guest.findMany({
    where: { eventId },
    orderBy: { submittedAt: 'asc' }, // Keep the first one
  });

  const seen = new Set();
  const toDelete = [];

  for (const guest of guests) {
    let val;
    if (fieldName === 'phone') {
      val = guest.phone;
    } else {
      try {
        const data = JSON.parse(guest.additionalData || '{}');
        val = data[fieldName];
      } catch (e) {
        val = null;
      }
    }

    if (!val) continue;

    const key = String(val).trim().toLowerCase();
    if (seen.has(key)) {
      toDelete.push(guest.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Found ${toDelete.length} duplicates. Deleting...`);
    await prisma.guest.deleteMany({
      where: {
        id: { in: toDelete },
      },
    });
    console.log('Cleanup complete.');
  } else {
    console.log('No duplicates found.');
  }
}

// Usage example:
// cleanDuplicates('some-event-id', 'phone');
