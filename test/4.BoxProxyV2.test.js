import hre from 'hardhat'
import { expect } from 'chai'

describe('Box (proxy) V2', function () {
  let box
  let boxV2

  beforeEach(async function () {
    const Box = await hre.ethers.getContractFactory('Box')
    const BoxV2 = await hre.ethers.getContractFactory('BoxV2')
    //initilize with 42
    box = await hre.upgrades.deployProxy(Box, [42], { initializer: 'store' })
    const address = await box.getAddress()
    boxV2 = await hre.upgrades.upgradeProxy(address, BoxV2)
  })

  it('should retrieve value previously stored and increment correctly', async function () {
    expect(await boxV2.retrieve()).to.equal(BigInt('42'))

    await boxV2.increment()
    //result = 42 + 1 = 43
    expect(await boxV2.retrieve()).to.equal(BigInt('43'))

    await boxV2.store(100)
    expect(await boxV2.retrieve()).to.equal(BigInt('100'))
  })
})
