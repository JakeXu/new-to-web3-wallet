import hre from 'hardhat'
import { updateEnv } from '../utils.js'

const PREFIX = `UPGRADE_${hre.network.name.toUpperCase()}`

async function main() {
  const proxyAddress = process.env[`${PREFIX}_PROXY`]
  const implementationAddress = process.env[`${PREFIX}_IMPLEMENTATION`]

  console.log(proxyAddress, ' original Box(proxy) address')

  const BoxV4 = await hre.ethers.getContractFactory('BoxV4')

  console.log('Preparing upgrade to BoxV4...')

  const boxV4Address = await hre.upgrades.prepareUpgrade(proxyAddress, BoxV4)

  console.log(boxV4Address, ' BoxV4 implementation contract address')

  updateEnv(`${PREFIX}_IMPLEMENTATION_V3`, implementationAddress)
  updateEnv(`${PREFIX}_IMPLEMENTATION`, boxV4Address)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
