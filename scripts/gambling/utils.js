import hre from 'hardhat'

export const PREFIX = `NEXT_PUBLIC_${hre.network.name.toUpperCase()}_LOTTERY`
export const LotteryAddress = process.env[PREFIX]
export const LotteryABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_lotteryId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_seed',
        type: 'uint256'
      }
    ],
    name: 'drawWinningNumbers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'lotteryId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint8[]',
        name: '_prizeDistribution',
        type: 'uint8[]'
      },
      {
        internalType: 'uint256',
        name: '_costPerTicket',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_startingTimestamp',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_closingTimestamp',
        type: 'uint256'
      }
    ],
    name: 'createNewLotto',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
