'use server'

import { sql } from '@vercel/postgres'
import { Owner, Hash } from '@/contants/types'

export const getOwners = async () => {
  const owners = await sql<Owner>`SELECT * FROM owners ORDER BY owner_order;`
  return owners.rows
}

export const getHashes = async (limit: number = 5) => {
  const hashes = await sql<Hash>`SELECT * FROM hashes ORDER BY time DESC LIMIT ${limit};`
  return hashes.rows
}

export const getHashByOwner = async (owner: string) => {
  const hashes = await sql<Hash>`SELECT * FROM hashes WHERE owner=${owner};`
  return hashes.rows
}

export const insertOwnerHash = async (owner: string, hash: string, time: string) => {
  const hashes = await sql<Hash>`INSERT INTO hashes (owner, hash, time) VALUES (${owner}, ${hash}, ${time});`
  console.log(hashes)
  return hashes.rows
}
