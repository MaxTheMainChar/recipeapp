import 'dotenv/config'

const config = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Use the same seed script you configured in package.json
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    // Use process.env here to avoid depending on prisma/config at runtime
    url: process.env.DATABASE_URL ?? '',
  },
}

export default config
