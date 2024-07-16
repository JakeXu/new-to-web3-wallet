'use client'
import { useState, useMemo, ReactNode } from 'react'
import { SimpleGrid, Box, Button, useToast } from '@chakra-ui/react'
import { formatEther } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useReadContracts, useWriteContract, useConfig } from 'wagmi'
import { TokenAbi, FarmingAbi, TOKEN_SYMBOL } from '@/contants/Abi'
import { parseUnits } from '@/utils'

type Props = {
  label: string
  value: number | string
  unit?: string
  extra?: ReactNode
}

const TextCard = ({ label, value, unit, extra }: Props) => {
  return (
    <Box className="relative" w="100%" padding={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
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
      <Box className="absolute right-4 bottom-4">{extra}</Box>
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
  const [isPending, setIsPending] = useState(false)
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const config = useConfig()
  const toast = useToast()

  const { data, refetch } = useReadContracts({
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

  const handleStake = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...TokenContract,
        functionName: 'approve',
        args: [FarmingContract.address, parseUnits('1')]
      })

      const approved = await waitForTransactionReceipt(config, { hash })

      if (approved) {
        const hash = await writeContractAsync({
          ...FarmingContract,
          functionName: 'deposit',
          args: [BigInt(0), parseUnits('1')]
        })
        const done = await waitForTransactionReceipt(config, { hash })

        if (done) {
          await refetch()
          toast({
            title: 'Successfully staked',
            status: 'success',
            isClosable: true
          })
        }
      }
    } catch (e: any) {
      toast({
        title: e.message,
        status: 'error',
        isClosable: true
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleWithDraw = async (title: string, amount: string = '1') => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...FarmingContract,
        functionName: 'withdraw',
        args: [BigInt(0), parseUnits(amount)]
      })
      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        await refetch()
        toast({
          title,
          status: 'success',
          isClosable: true
        })
      }
    } catch (e: any) {
      toast({
        title: e.message,
        status: 'error',
        isClosable: true
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleUnstake = async () => {
    await handleWithDraw('Successfully unstaked')
  }

  const handleClaim = async () => {
    await handleWithDraw('Successfully claimed', '0')
  }

  return (
    <>
      <div className="border-2 border-fuchsia-600 m-10">
        <SimpleGrid className="px-40 py-20" minChildWidth="120px" spacing="40px">
          <TextCard label="Total Staked" value={totalDeposits} unit={TOKEN_SYMBOL} />
          <TextCard
            label="My Staked"
            value={deposited}
            unit={TOKEN_SYMBOL}
            extra={
              <>
                <Button
                  isDisabled={isPending}
                  onClick={handleStake}
                  className="bg-purple-600"
                  colorScheme="purple"
                  variant="solid"
                  size="xs"
                >
                  Stake
                </Button>
                {deposited !== '0' && (
                  <>
                    <Box className="text-purple-600 mx-1" as="span">
                      /
                    </Box>
                    <Button
                      onClick={handleUnstake}
                      isDisabled={isPending}
                      className="bg-purple-400"
                      colorScheme="purple"
                      variant="solid"
                      size="xs"
                    >
                      Unstake
                    </Button>
                  </>
                )}
              </>
            }
          />
          <TextCard
            label="My Rewards"
            value={rewards}
            unit={TOKEN_SYMBOL}
            extra={
              rewards !== '0' && (
                <Button
                  onClick={handleClaim}
                  isDisabled={isPending}
                  className="bg-purple-600"
                  colorScheme="purple"
                  variant="solid"
                  size="xs"
                >
                  Claim
                </Button>
              )
            }
          />
          <TextCard label="My JAK" value={tokens} />
        </SimpleGrid>
      </div>
    </>
  )
}

export default Staking
