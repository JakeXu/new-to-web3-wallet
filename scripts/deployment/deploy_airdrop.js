import hre from 'hardhat'
import { updateEnv } from '../utils.js'

async function main() {
  const jakTokenAddress = process.env[`${hre.network.name.toUpperCase()}_JAK_TOKEN`]
  console.log('JAKToken Address: ', jakTokenAddress)

  const AirdropFactory = await hre.ethers.getContractFactory('Airdrop')
  const Airdrop = await AirdropFactory.deploy(jakTokenAddress)
  await Airdrop.waitForDeployment()
  const address = await Airdrop.getAddress()
  console.log('Airdrop deployed to: ', address)

  updateEnv(`${hre.network.name.toUpperCase()}_AIRDROP`, address)
  // send JAK token to airdrop contract
  const JAKToken = await hre.ethers.getContractAt('JAKToken', jakTokenAddress)
  let tx = await JAKToken.transfer(address, hre.ethers.parseEther('10000'))
  // wait for transfer
  await tx.wait()
  // get airdrop balance of JAK token
  const balance = await JAKToken.balanceOf(address)
  console.log('Airdrop balance of JAK token: ', hre.ethers.formatEther(balance))
  // test airdrop
  tx = await Airdrop.withdrawTokens()
  await tx.wait()
  // get airdrop balance of JAK token
  const balanceAfter = await JAKToken.balanceOf(address)
  console.log('Airdrop balance of JAK token after withdrawTokens: ', hre.ethers.formatEther(balanceAfter))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
