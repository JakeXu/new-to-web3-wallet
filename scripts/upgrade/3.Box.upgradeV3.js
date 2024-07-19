import hre from 'hardhat'
import { updateEnv } from '../utils.js'

const PREFIX = `UPGRADE_${hre.network.name.toUpperCase()}`

async function main() {
  const proxyAddress = process.env[`${PREFIX}_PROXY`]
  const implementationAddress = process.env[`${PREFIX}_IMPLEMENTATION`]

  console.log(proxyAddress, ' original Box(proxy) address')

  const BoxV3 = await hre.ethers.getContractFactory('BoxV3')

  console.log('upgrade to BoxV3...')

  const boxV3Proxy = await hre.upgrades.upgradeProxy(proxyAddress, BoxV3)
  const proxyV3Address = await boxV3Proxy.getAddress()
  const implementationV3Address = await hre.upgrades.erc1967.getImplementationAddress(proxyV3Address)
  const adminV3Address = await hre.upgrades.erc1967.getAdminAddress(proxyV3Address)

  updateEnv(`${PREFIX}_IMPLEMENTATION_V2`, implementationAddress)
  updateEnv(`${PREFIX}_PROXY`, proxyAddress)
  updateEnv(`${PREFIX}_IMPLEMENTATION`, implementationV3Address)
  updateEnv(`${PREFIX}_ADMIN`, adminV3Address)

  console.log(proxyV3Address, ' BoxV3 address(should be the same)')
  console.log(implementationV3Address, ' getImplementationAddress')
  console.log(adminV3Address, ' getAdminAddress')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
