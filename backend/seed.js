const prisma = require('./prismaClient');

async function main() {
  const categories = ['Work', 'Personal', 'Urgent'];

  for (const name of categories) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (!existing) {
      await prisma.category.create({ data: { name } });
      console.log(`Created category: ${name}`);
    } else {
      console.log(`Category already exists: ${name}`);
    }
  }
}

main()
  .then(() => {
    console.log('Seeding complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });