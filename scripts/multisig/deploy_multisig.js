import hre from 'hardhat'
import { updateEnv, getOwners } from '../utils.js'

async function main() {
  const MSW = await hre.ethers.getContractFactory('MultiSigWallet')
  // to: 0x4006358B6EFC1d284FA94E8CE44179327c627924
  const owners = getOwners(hre.network.name)

  const MultiSigWallet = await MSW.deploy(owners, 3)
  await MultiSigWallet.waitForDeployment()
  const address = await MultiSigWallet.getAddress()
  console.log('MultiSigWallet deployed to: ', address)

  updateEnv(`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_MULTISIGWALLET`, address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
