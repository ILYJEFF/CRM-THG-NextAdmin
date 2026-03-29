/**
 * Run after migration: npx tsx scripts/seed-playbook.ts
 * Idempotent: skips slugs that already exist.
 */
import { PrismaClient } from "@prisma/client";
import { PLAYBOOK_DEFAULT_SECTIONS } from "../src/lib/crm/playbook-defaults";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  for (const row of PLAYBOOK_DEFAULT_SECTIONS) {
    const existing = await prisma.crmPlaybookSection.findUnique({
      where: { slug: row.slug },
    });
    if (existing) continue;
    await prisma.crmPlaybookSection.create({
      data: {
        slug: row.slug,
        eyebrow: row.eyebrow,
        title: row.title,
        sortOrder: row.sortOrder,
        body: row.body,
      },
    });
    created += 1;
    console.log("Created playbook section:", row.slug);
  }
  console.log("Done. Created:", created, "Skipped existing.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
