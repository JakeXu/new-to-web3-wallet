import hre from 'hardhat'
import { updateEnv } from '../utils.js'

const PREFIX = `UPGRADE_${hre.network.name.toUpperCase()}`

async function main() {
  const Box = await hre.ethers.getContractFactory('Box')
  console.log('Deploying Box...')
  const boxProxy = await hre.upgrades.deployProxy(Box, [42], { initializer: 'store' })
  const proxyAddress = await boxProxy.getAddress()
  const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress)
  const adminAddress = await hre.upgrades.erc1967.getAdminAddress(proxyAddress)

  updateEnv(`${PREFIX}_PROXY`, proxyAddress)
  updateEnv(`${PREFIX}_IMPLEMENTATION`, implementationAddress)
  updateEnv(`${PREFIX}_ADMIN`, adminAddress)
  console.log(proxyAddress, ' box(proxy) address')
  console.log(implementationAddress, ' getImplementationAddress')
  console.log(adminAddress, ' getAdminAddress')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
