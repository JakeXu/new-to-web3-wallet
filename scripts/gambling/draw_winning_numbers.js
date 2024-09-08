import hre from 'hardhat'
import { LotteryAddress, LotteryABI } from './utils.js'

async function main() {
  console.log('Start to draw winningNumbers.')
  const accounts = await hre.ethers.getSigners()
  const owner = accounts[0]

  const Lottery = await hre.ethers.getContractAt(LotteryABI, LotteryAddress, owner)

  const lotteryId = await Lottery.lotteryId()
  const tx = await Lottery.drawWinningNumbers(lotteryId, Math.random() * Math.pow(10, 17))
  await tx.wait()
  console.log('Draw winningNumbers Done.')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
