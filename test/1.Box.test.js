import { expect } from 'chai'
import hre from 'hardhat'

describe('Box', function () {
  let box

  beforeEach(async function () {
    const Box = await hre.ethers.getContractFactory('Box')
    box = await Box.deploy()
    await box.waitForDeployment()
  })

  it('should retrieve value previously stored', async function () {
    await box.store(42)
    expect(await box.retrieve()).to.equal(BigInt('42'))

    await box.store(100)
    expect(await box.retrieve()).to.equal(BigInt('100'))

    await expect(box.store(100)).to.emit(box, 'ValueChanged').withArgs(100)
  })
})

// NOTE: should also add test for event: event ValueChanged(uint256 newValue)
