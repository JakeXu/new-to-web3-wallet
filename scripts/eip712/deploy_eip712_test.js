import hre from 'hardhat'
import { updateEnv } from '../utils.js'

async function main() {
  const EIP712TestFactory = await hre.ethers.getContractFactory('EIP712Test')
  const EIP712Test = await EIP712TestFactory.deploy()
  await EIP712Test.waitForDeployment()
  const address = await EIP712Test.getAddress()
  console.log('EIP712Test deployed to: ', address)

  updateEnv(`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_EIP712TEST`, address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
