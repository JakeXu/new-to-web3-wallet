import hre from 'hardhat'
import { updateEnv } from '../utils.js'

async function main() {
  const MF = await hre.ethers.getContractFactory('MobileFactory')
  const MobileFactory = await MF.deploy()
  await MobileFactory.waitForDeployment()
  const address = await MobileFactory.getAddress()
  console.log('MobileFactory deployed to: ', address)

  updateEnv(`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_MOBILEFACTORY`, address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
