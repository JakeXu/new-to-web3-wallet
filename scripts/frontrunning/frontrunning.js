import { ethers } from 'ethers'

// 1. 创建provider
const url = 'http://127.0.0.1:8545'
let provider = new ethers.WebSocketProvider(url)
const network = provider.getNetwork()
network.then(res => console.log(`[${new Date().toLocaleTimeString()}] 连接到 chain ID ${res.chainId}`))

// 2. 创建interface对象，用于解码交易详情。
const iface = new ethers.Interface(['function mint() external'])

// 3. 创建钱包，用于发送抢跑交易
const privateKey = '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6' // 对应EOA地址: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
const wallet = new ethers.Wallet(privateKey, provider)

const main = async () => {
  // 4. 监听pending的mint交易，获取交易详情，然后解码。
  console.log('\n4. 监听pending交易，获取txHash，并输出交易详情。')

  // 调用mint方法的EOA地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  provider.on('pending', async txHash => {
    if (!txHash) return

    // 获取tx详情
    const tx = await provider.getTransaction(txHash)
    if (tx) {
      // filter pendingTx.data
      if (tx.data.includes(iface.getFunction('mint').selector) && tx.from !== wallet.address) {
        // 打印txHash
        console.log(`\n[${new Date().toLocaleTimeString()}] 监听Pending交易: ${txHash} \r`)

        // 打印解码的交易详情
        let parsedTx = iface.parseTransaction(tx)
        console.log('\nPending交易详情解码：')
        console.log(parsedTx)
        // Input data解码
        console.log('\nRaw Transaction')
        console.log(tx)

        // 构建抢跑tx
        const frontRunningTx = {
          to: tx.to,
          value: tx.value,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas * BigInt(2),
          maxFeePerGas: tx.maxFeePerGas * BigInt(2),
          gasLimit: tx.gasLimit * BigInt(2),
          data: tx.data
        }
        // 发送抢跑交易
        const txResponse = await wallet.sendTransaction(frontRunningTx)
        console.log(`\n[${new Date().toLocaleTimeString()}] 正在 front running 交易`)
        await txResponse.wait()
        console.log(`\n[${new Date().toLocaleTimeString()}] front running 交易成功`)
      }
    }
  })
}

main()
