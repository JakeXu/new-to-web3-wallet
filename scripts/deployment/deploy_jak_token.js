import hre from 'hardhat'
import { updateEnv } from '../utils.js'

async function main() {
  const tokenName = 'JAK'
  const symbol = 'JAK'
  const totalSupply = '1000000000000000000000000000'
  const decimals = 18

  const JAKTokenFactory = await hre.ethers.getContractFactory('JAKToken')
  const JAKToken = await JAKTokenFactory.deploy(tokenName, symbol, totalSupply, decimals)
  await JAKToken.waitForDeployment()
  const address = await JAKToken.getAddress()
  console.log('JAK deployed to: ', address)

  updateEnv(`${hre.network.name.toUpperCase()}_JAK_TOKEN`, address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
