import hre from 'hardhat'
import { expect } from 'chai'

describe('Box (proxy)', function () {
  let box

  beforeEach(async function () {
    const Box = await hre.ethers.getContractFactory('Box')
    //initilize with 42
    box = await hre.upgrades.deployProxy(Box, [42], { initializer: 'store' })
  })

  it('should retrieve value previously stored', async function () {
    // console.log(box.address," box(proxy)")
    // console.log(await upgrades.erc1967.getImplementationAddress(box.address)," getImplementationAddress")
    // console.log(await upgrades.erc1967.getAdminAddress(box.address), " getAdminAddress")

    expect(await box.retrieve()).to.equal(BigInt('42'))

    await box.store(100)
    expect(await box.retrieve()).to.equal(BigInt('100'))
  })
})
