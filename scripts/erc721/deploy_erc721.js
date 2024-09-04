import hre from 'hardhat'
import { updateEnv } from '../utils.js'

async function main() {
  const UA = await hre.ethers.getContractFactory('UglyAvatars')
  const owner = process.env[`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_ERC721_OWNER`]
  const UglyAvatars = await UA.deploy(owner)
  await UglyAvatars.waitForDeployment()
  const address = await UglyAvatars.getAddress()
  console.log('UglyAvatars deployed to: ', address)

  updateEnv(`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_UGLYAVATARS`, address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
