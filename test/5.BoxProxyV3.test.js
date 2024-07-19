import hre from 'hardhat'
import { expect } from 'chai'

describe('Box (proxy) V3', function () {
  let box
  let boxV2
  let boxV3

  beforeEach(async function () {
    const Box = await hre.ethers.getContractFactory('Box')
    const BoxV2 = await hre.ethers.getContractFactory('BoxV2')
    const BoxV3 = await hre.ethers.getContractFactory('BoxV3')
    //initilize with 42
    box = await hre.upgrades.deployProxy(Box, [42], { initializer: 'store' })
    const address = await box.getAddress()
    boxV2 = await hre.upgrades.upgradeProxy(address, BoxV2)
    boxV3 = await hre.upgrades.upgradeProxy(address, BoxV3)
  })

  it('should retrieve value previously stored and increment correctly', async function () {
    expect(await boxV2.retrieve()).to.equal(BigInt('42'))
    await boxV3.increment()
    expect(await boxV2.retrieve()).to.equal(BigInt('43'))

    await boxV2.store(100)
    expect(await boxV2.retrieve()).to.equal(BigInt('100'))
  })

  it('should set name correctly in V3', async function () {
    expect(await boxV3.name()).to.equal('')

    const boxName = 'my Box V3'
    await boxV3.setName(boxName)
    expect(await boxV3.name()).to.equal(boxName)
  })
})
