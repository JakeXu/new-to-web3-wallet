import { expect } from 'chai'
import hre from 'hardhat'

describe('Box V2', function () {
  let boxV2

  beforeEach(async function () {
    const BoxV2 = await hre.ethers.getContractFactory('BoxV2')
    boxV2 = await BoxV2.deploy()
    await boxV2.waitForDeployment()
  })

  it('should retrievevalue previously stored', async function () {
    await boxV2.store(42)
    expect(await boxV2.retrieve()).to.equal(BigInt('42'))

    await boxV2.store(100)
    expect(await boxV2.retrieve()).to.equal(BigInt('100'))
  })

  it('should increment value correctly', async function () {
    await boxV2.store(42)
    await boxV2.increment()
    expect(await boxV2.retrieve()).to.equal(BigInt('43'))
  })
})

// NOTE: should also add test for event: event ValueChanged(uint256 newValue)
