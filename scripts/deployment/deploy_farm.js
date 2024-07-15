import hre from 'hardhat'
import { updateEnv } from '../utils.js'

async function main() {
  const RPS = '1'
  const startTS = 1752203471
  const jakTokenAddress = process.env[`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_JAK_TOKEN`]
  console.log('JAKToken Address: ', jakTokenAddress)

  const FarmingJAKFactory = await hre.ethers.getContractFactory('FarmingJAK')
  const FarmingJAK = await FarmingJAKFactory.deploy(jakTokenAddress, hre.ethers.parseEther(RPS), startTS)
  await FarmingJAK.waitForDeployment()
  const address = await FarmingJAK.getAddress()
  console.log('Farm deployed to: ', address)

  updateEnv(`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_FARMING_JAK`, address)

  // fund the farm
  // approve the farm to spend the token
  const JAKToken = await hre.ethers.getContractAt('JAKToken', jakTokenAddress)
  const approveTx = await JAKToken.approve(address, hre.ethers.parseEther('10000'))
  await approveTx.wait()
  let tx = await FarmingJAK.fund(hre.ethers.parseEther('10000'))
  await tx.wait()
  // add lp token
  await FarmingJAK.add(100, jakTokenAddress, true)
  console.log('Farm funded and LP token added')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
