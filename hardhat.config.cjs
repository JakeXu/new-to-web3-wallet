require('dotenv').config()
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-web3')
require('@openzeppelin/hardhat-upgrades')
require('@nomicfoundation/hardhat-chai-matchers')
// https://hardhat.org/hardhat-chai-matchers/docs/migrate-from-waffle
// https://hardhat.org/hardhat-chai-matchers/docs/overview

// Ignore Solidity files during compilation
const { subtask } = require('hardhat/config')
const { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } = require('hardhat/builtin-tasks/task-names')

subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(async (_, __, runSuper) => {
  const paths = await runSuper()

  return paths.filter(p => !p.endsWith('.ignore.sol'))
})

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    local: {
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
