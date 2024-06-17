export const getEllipsisWords = (str: `0x${string}`, n: number = 6): string => {
  if (str) {
    return `${str.slice(0, n)}...${str.slice(str.length - n)}`
  }
  return ''
}

export const getChain = (chainId: number, chains: readonly any[]) => {
  const chain = chains.find(chain => chain.id === chainId)
  if (!chain) throw new Error(`无法找到链ID为 ${chainId} 的配置`)
  return chain
}

export const getTransport = (chainId: number, transports: any) => {
  const transport = transports[chainId]
  if (!transport) throw new Error(`无法找到链ID为 ${chainId} 的传输方式`)
  return transport
}
