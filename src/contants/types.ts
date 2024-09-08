import { z } from 'zod'

export type SolidityTypesAsString =
  | 'address'
  | 'bytes'
  | 'bytes1'
  | 'bytes2'
  | 'bytes3'
  | 'bytes4'
  | 'bytes5'
  | 'bytes6'
  | 'bytes7'
  | 'bytes8'
  | 'bytes9'
  | 'bytes10'
  | 'bytes11'
  | 'bytes12'
  | 'bytes13'
  | 'bytes14'
  | 'bytes15'
  | 'bytes16'
  | 'bytes17'
  | 'bytes18'
  | 'bytes19'
  | 'bytes20'
  | 'bytes21'
  | 'bytes22'
  | 'bytes23'
  | 'bytes24'
  | 'bytes25'
  | 'bytes26'
  | 'bytes27'
  | 'bytes28'
  | 'bytes29'
  | 'bytes30'
  | 'bytes31'
  | 'bytes32'
  | 'string'
  | 'uint8'
  | 'uint256'

export type EIP712TypeDefinition = {
  [key: string]: {
    name: string
    type: SolidityTypesAsString
  }[]
}

export type EIP712Domain = {
  name: string
  version: string
  verifyingContract: `0x${string}`
  chainId: number
}

export type Mobile = {
  serialNumber: number
  color: string
  display: number // 显示屏大小 6.7-inch
  capacity: number //  储存空间大小 256g
  steps: number // 总共加工次数
  operator: `0x${string}` // 可以更新此合约数据的用户
}

export const Color = z.enum(['Red', 'Green', 'Purple']).enum

export const Colors = {
  '1': Color.Red,
  '2': Color.Green,
  '3': Color.Purple
}

export const Display = z.enum(['6.7″', '6.1″', '5.4″']).enum

export const Displays = {
  '1': Display['6.7″'],
  '2': Display['6.1″'],
  '3': Display['5.4″']
}

export const Capacity = z.enum(['64G', '128G', '256G']).enum

export const Capacities = {
  '1': Capacity['64G'],
  '2': Capacity['128G'],
  '3': Capacity['256G']
}

export const Owner = z.object({
  id: z.string(),
  owner: z.string(),
  owner_order: z.number(),
  status: z.enum(['ACTIVE', 'INACTIVE'])
})
export interface Owner extends z.TypeOf<typeof Owner> {}

export const Hash = z.object({
  id: z.string(),
  owner: z.string(),
  hash: z.string(),
  time: z.bigint()
})
export interface Hash extends z.TypeOf<typeof Hash> {}

export const NFT = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string()
})
export interface NFT extends z.TypeOf<typeof NFT> {}

export const LottoStatus = z.enum(['NotStarted', 'Open', 'Completed'])
export type LottoStatus = z.infer<typeof LottoStatus>

export const LottoInfo = z.object({
  lotteryID: z.bigint(),
  lotteryStatus: z.number(),
  prizePool: z.bigint(),
  costPerTicket: z.bigint(),
  prizeDistribution: z.array(z.number()),
  startingTimestamp: z.bigint(),
  closingTimestamp: z.bigint(),
  winningNumbers: z.array(z.number()),
  winningDistribution: z.array(z.number())
})
export interface LottoInfo extends z.TypeOf<typeof LottoInfo> {}
