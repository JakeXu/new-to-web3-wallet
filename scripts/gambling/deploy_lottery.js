import hre from 'hardhat'
import { PREFIX } from './utils.js'
import { updateEnv } from '../utils.js'

const NFT_URI = 'https://bronze-wooden-tern-205.mypinata.cloud/ipfs/QmaChABG53yS2UnJusmGaZyJk6SYkdxFVogyThyzAe99v1'

async function main() {
  console.log('Start to deploy.')
  const owner = process.env[`${PREFIX}_OWNER`]
  const sizeOfLotteryNumbers = 5

  const LotteryFactory = await hre.ethers.getContractFactory('Lottery')
  const Lottery = await LotteryFactory.deploy(owner, sizeOfLotteryNumbers)
  await Lottery.waitForDeployment()
  const address = await Lottery.getAddress()
  console.log('Lottery deployed to: ', address)

  updateEnv(PREFIX, address)

  const RandomNumberGeneratorFactory = await hre.ethers.getContractFactory('RandomNumberGenerator')
  const RandomNumberGenerator = await RandomNumberGeneratorFactory.deploy(address)
  await RandomNumberGenerator.waitForDeployment()
  const addressRNG = await RandomNumberGenerator.getAddress()
  console.log('RandomNumberGenerator deployed to: ', addressRNG)

  updateEnv(`${PREFIX}_RNG`, addressRNG)

  const LotteryNFTFactory = await hre.ethers.getContractFactory('LotteryNFT')
  const LotteryNFT = await LotteryNFTFactory.deploy(NFT_URI, address)
  await LotteryNFT.waitForDeployment()
  const addressNFT = await LotteryNFT.getAddress()
  console.log('LotteryNFT deployed to: ', addressNFT)

  updateEnv(`${PREFIX}_NFT`, addressNFT)

  let tx = await Lottery.initialize(addressNFT, addressRNG)
  await tx.wait()

  console.log('Deployed.')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
