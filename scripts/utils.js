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
