import hre from 'hardhat'
import { updateEnv } from '../utils.js'

const PREFIX = `UPGRADE_${hre.network.name.toUpperCase()}`

async function main() {
  const proxyAddress = process.env[`${PREFIX}_PROXY`]
  const implementationAddress = process.env[`${PREFIX}_IMPLEMENTATION`]

  console.log(proxyAddress, ' original Box(proxy) address')

  const BoxV2 = await hre.ethers.getContractFactory('BoxV2')

  console.log('upgrade to BoxV2...')

  const boxV2Proxy = await hre.upgrades.upgradeProxy(proxyAddress, BoxV2)
  const proxyV2Address = await boxV2Proxy.getAddress()
  const implementationV2Address = await hre.upgrades.erc1967.getImplementationAddress(proxyV2Address)
  const adminV2Address = await hre.upgrades.erc1967.getAdminAddress(proxyV2Address)

  updateEnv(`${PREFIX}_IMPLEMENTATION_V1`, implementationAddress)
  updateEnv(`${PREFIX}_PROXY`, proxyAddress)
  updateEnv(`${PREFIX}_IMPLEMENTATION`, implementationV2Address)
  updateEnv(`${PREFIX}_ADMIN`, adminV2Address)

  console.log(proxyV2Address, ' BoxV2 address(should be the same)')
  console.log(implementationV2Address, ' getImplementationAddress')
  console.log(adminV2Address, ' getAdminAddress')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
