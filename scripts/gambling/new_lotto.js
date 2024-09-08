import hre from 'hardhat'
import { LotteryAddress, LotteryABI } from './utils.js'

async function main() {
  console.log('Start to new lotto.')
  const accounts = await hre.ethers.getSigners()
  const owner = accounts[0]

  const Lottery = await hre.ethers.getContractAt(LotteryABI, LotteryAddress, owner)
  const { timestamp } = await hre.ethers.provider.getBlock('latest')
  const startTS = timestamp + 2 * 60 * 60
  const closeTS = startTS + 5 * 24 * 60 * 60
  const tx = await Lottery.createNewLotto(['5', '10', '15', '25', '45'], BigInt(100000000000000000), startTS, closeTS)
  await tx.wait()
  console.log('New lotto Done.')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
