import { createClient } from '@vercel/postgres'
import dotenv from 'dotenv'
import { getOwners } from '../utils.js'

dotenv.config()

async function seedOwners(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    // Create the "owners" table if it doesn't exist
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS owners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner VARCHAR(50) NOT NULL,
    owner_order INT NOT NULL,
    status VARCHAR(10) NOT NULL
  );
`

    console.log(`Created "owners" table`)

    // Insert data into the "owners" table
    const insertedOwners = await Promise.all(
      getOwners().map(async (owner, index) => {
        const id = `410544b2-4001-4271-9855-fec4b6a6442${index}`
        const status = 'ACTIVE'

        return client.sql`
        INSERT INTO owners (id, owner, owner_order, status)
        VALUES (${id}, ${owner}, ${index + 1}, ${status})
        ON CONFLICT (id) DO NOTHING;
      `
      })
    )

    console.log(`Seeded ${insertedOwners.length} owners`)

    return {
      createTable,
      owners: insertedOwners
    }
  } catch (error) {
    console.error('Error seeding owners:', error)
    throw error
  }
}

async function seedHashes(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    // Create the "hashes" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS hashes (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        owner VARCHAR(50) NOT NULL,
        hash VARCHAR(255) NOT NULL,
        time BIGINT NOT NULL
      );
    `

    console.log(`Created "hashes" table`)

    return {
      createTable
    }
  } catch (error) {
    console.error('Error seeding hashes:', error)
    throw error
  }
}

async function main() {
  const client = createClient()
  await client.connect()

  await seedOwners(client)
  await seedHashes(client)

  await client.end()
}

main().catch(err => {
  console.error('An error occurred while attempting to seed the database:', err)
  process.exit(1)
})
