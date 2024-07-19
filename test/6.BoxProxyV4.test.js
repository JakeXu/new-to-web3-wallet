import hre from 'hardhat'
import { expect } from 'chai'

describe('Box (proxy) V4', function () {
  let box
  let boxV2
  let boxV3
  let boxV4

  beforeEach(async function () {
    const Box = await hre.ethers.getContractFactory('Box')
    const BoxV2 = await hre.ethers.getContractFactory('BoxV2')
    const BoxV3 = await hre.ethers.getContractFactory('BoxV3')
    const BoxV4 = await hre.ethers.getContractFactory('BoxV4')
    //initilize with 42
    box = await hre.upgrades.deployProxy(Box, [42], { initializer: 'store' })
    const address = await box.getAddress()
    boxV2 = await hre.upgrades.upgradeProxy(address, BoxV2)
    boxV3 = await hre.upgrades.upgradeProxy(address, BoxV3)
    boxV4 = await hre.upgrades.upgradeProxy(address, BoxV4)
  })

  it('should retrieve value previously stored and increment correctly', async function () {
    expect(await boxV4.retrieve()).to.equal(BigInt('42'))
    await boxV4.increment()
    expect(await boxV4.retrieve()).to.equal(BigInt('43'))

    await boxV2.store(100)
    expect(await boxV2.retrieve()).to.equal(BigInt('100'))
  })

  it('should setName and getName correctly in V4', async function () {
    //name() removed, getName() now
    // expect(boxV4).to.not.have.own.property("name")
    expect(boxV4.name).to.be.undefined
    expect(await boxV4.getName()).to.equal('Name: ')

    const boxname = 'my Box V4'
    await boxV4.setName(boxname)
    expect(await boxV4.getName()).to.equal('Name: ' + boxname)
  })
})
