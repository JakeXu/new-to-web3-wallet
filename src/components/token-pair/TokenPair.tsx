import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer, Button } from '@chakra-ui/react'
import { formatEther } from 'viem'
import { useConfig, useAccount, useReadContracts, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { JTokenAbi, UniswapV2PairAbi } from '@/contants/Abi'
import { useNotify } from '@/hooks'

const JTokenContract = {
  abi: JTokenAbi
} as const

const UniswapV2PairContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR as `0x${string}`,
  abi: UniswapV2PairAbi
} as const

const TokenPair = forwardRef(({}, ref) => {
  const [isPending, setIsPending] = useState(false)
  const { address } = useAccount()
  const { notifyError, notifySuccess } = useNotify()
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const { data, isFetching, refetch } = useReadContracts({
    contracts: [
      {
        ...UniswapV2PairContract,
        functionName: 'balanceOf',
        args: [address!]
      },
      {
        ...UniswapV2PairContract,
        functionName: 'totalSupply'
      },
      {
        ...UniswapV2PairContract,
        functionName: 'getReserves'
      },
      {
        ...JTokenContract,
        address: process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_A as `0x${string}`,
        functionName: 'balanceOf',
        args: [address!]
      },
      {
        ...JTokenContract,
        address: process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B as `0x${string}`,
        functionName: 'balanceOf',
        args: [address!]
      }
    ]
  })

  const { balance, totalSupply, percent, balanceA, balanceB, reserveA, reserveB } = useMemo(() => {
    if (!data) return { balance: '0', totalSupply: '0', percent: '0' }
    const balance = data?.[0]?.result || BigInt(0)
    const totalSupply = data?.[1]?.result || BigInt(0)
    const percent = parseFloat(((balance * BigInt(10000)) / (totalSupply || BigInt(1)) / BigInt(100)).toString()).toFixed(2)
    const reserves = data?.[2]?.result || [BigInt(0), BigInt(0), 0]
    const reserveA = formatEther(reserves[0] || BigInt(0))
    const reserveB = formatEther(reserves[1] || BigInt(0))
    const balanceA = formatEther(data?.[3]?.result || BigInt(0))
    const balanceB = formatEther(data?.[4]?.result || BigInt(0))
    return { balance: balance.toString(), totalSupply: totalSupply.toString(), percent, balanceA, balanceB, reserveA, reserveB }
  }, [data])

  useImperativeHandle(ref, () => ({
    balance,
    refetch
  }))

  const handleFaucet = (address?: string) => async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...JTokenContract,
        address: address as `0x${string}`,
        functionName: 'faucet'
      })

      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        await refetch()
        notifySuccess({
          title: 'Success:',
          message: hash
        })
      }
    } catch (e: any) {
      notifyError({
        title: 'Error:',
        message: e.message
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <TableContainer>
      <Table variant="unsyled">
        <TableCaption fontSize="1.25rem" placement="top">
          LP Info
        </TableCaption>
        <Thead>
          <Tr>
            <Th>Balance</Th>
            <Th>Total</Th>
            <Th>Percent(%)</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{balance}</Td>
            <Td>{totalSupply}</Td>
            <Td>{percent}</Td>
          </Tr>
        </Tbody>
      </Table>
      <Table variant="unsyled">
        <TableCaption fontSize="1.25rem" placement="top">
          Swap Token Info
        </TableCaption>
        <Thead>
          <Tr>
            <Th>Token Address</Th>
            <Th>Reserve</Th>
            <Th>Balance</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <b>TokenA: </b>
              {process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_A}
            </Td>
            <Td>{reserveA}</Td>
            <Td>{balanceA}</Td>
            <Td>
              <Button
                variant="solid"
                size="xs"
                onClick={handleFaucet(process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_A)}
                isLoading={isPending || isFetching}
                className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
              >
                Faucet
              </Button>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <b>TokenB: </b>
              {process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B}
            </Td>
            <Td>{reserveB}</Td>
            <Td>{balanceB}</Td>
            <Td>
              <Button
                variant="solid"
                size="xs"
                onClick={handleFaucet(process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B)}
                isLoading={isPending || isFetching}
                className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
              >
                Faucet
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  )
})

TokenPair.displayName = 'TokenPair'

export default TokenPair
