import { loadConfig } from '@dtodo/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  loadConfig('prisma');

  const prisma = new PrismaClient();

  await prisma.foundationProbe.upsert({
    where: { key: 'm0-foundation' },
    update: {},
    create: { key: 'm0-foundation' },
  });

  await prisma.$disconnect();

  console.log('M0 seed completed. Technical foundation probe is present.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
