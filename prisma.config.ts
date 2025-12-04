import 'dotenv/config'

const config = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Use the same seed script you configured in package.json
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    // Provide connection URL for migrations and Prisma CLI (Prisma v7+)
    url: process.env.DATABASE_URL ?? '',
  },
}

export default config
