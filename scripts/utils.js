import fs from 'fs'
import dotenv from 'dotenv'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const envFilePath = path.resolve(__dirname, '../.env')
const envConfig = dotenv.parse(fs.readFileSync(envFilePath))

export function updateEnv(key, value) {
  envConfig[key] = value

  const newEnvConfig = Object.keys(envConfig)
    .map(k => `${k}=${envConfig[k]}`)
    .join('\n')

  fs.writeFileSync(envFilePath, newEnvConfig)
  console.log(`Updated ${key} in .env file`)
}

export function getOwners(network = 'sepolia') {
  const name = network.toUpperCase()
  const owner1 = envConfig[`NEXT_PUBLIC_${name}_MULTISIGWALLET_OWNER1`]
  const owner2 = envConfig[`NEXT_PUBLIC_${name}_MULTISIGWALLET_OWNER2`]
  const owner3 = envConfig[`NEXT_PUBLIC_${name}_MULTISIGWALLET_OWNER3`]
  const owner4 = envConfig[`NEXT_PUBLIC_${name}_MULTISIGWALLET_OWNER4`]

  return [owner1, owner2, owner3, owner4].sort((a, b) => {
    if (a.toLowerCase() < b.toLowerCase()) return -1
    if (a.toLowerCase() > b.toLowerCase()) return 1
    return 0
  })
}
