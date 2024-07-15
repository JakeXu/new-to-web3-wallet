'use client'
import { useMemo } from 'react'
import { SimpleGrid, Box } from '@chakra-ui/react'
import { formatEther } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'
import { TokenAbi, FarmingAbi, TOKEN_SYMBOL } from '@/contants/Abi'

type Props = {
  label: string
  value: number | string
  unit?: string
}

const TextCard = ({ label, value, unit }: Props) => {
  return (
    <Box w="100%" padding={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Box mt="1" fontWeight="semibold" as="h4">
        {label}
      </Box>
      <Box>
        {value}
        {unit && (
          <Box className="m-2" as="span" color="gray.600" fontSize="sm">
            {unit}
          </Box>
        )}
      </Box>
    </Box>
  )
}

const FarmingContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_FARMING_JAK as `0x${string}`,
  abi: FarmingAbi
} as const

const TokenContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_JAK_TOKEN as `0x${string}`,
  abi: TokenAbi
} as const

const Staking = () => {
  const { address } = useAccount()

  const { data } = useReadContracts({
    contracts: [
      {
        ...FarmingContract,
        functionName: 'poolInfo',
        args: [BigInt(0)]
      },
      {
        ...FarmingContract,
        functionName: 'deposited',
        args: [BigInt(0), address!]
      },
      {
        ...FarmingContract,
        functionName: 'pending',
        args: [BigInt(0), address!]
      },
      {
        ...TokenContract,
        functionName: 'balanceOf',
        args: [address!]
      }
    ]
  })

  const { totalDeposits, deposited, rewards, tokens } = useMemo(() => {
    const totalDeposits = formatEther(data?.[0]?.result?.[4] || BigInt(0))
    const deposited = formatEther(data?.[1]?.result || BigInt(0))
    const rewards = formatEther(data?.[2]?.result || BigInt(0))
    const tokens = formatEther(data?.[3]?.result || BigInt(0))
    return { totalDeposits, deposited, rewards, tokens }
  }, [data])

  return (
    <>
      <div className="border-2 border-fuchsia-600 m-10">
        <SimpleGrid className="px-40 py-20" minChildWidth="120px" spacing="40px">
          <TextCard label="Total Staked" value={totalDeposits} unit={TOKEN_SYMBOL} />
          <TextCard label="My Staked" value={deposited} unit={TOKEN_SYMBOL} />
          <TextCard label="My Rewards" value={rewards} unit={TOKEN_SYMBOL} />
          <TextCard label="My JAK" value={tokens} />
        </SimpleGrid>
      </div>
    </>
  )
}

export default Staking
