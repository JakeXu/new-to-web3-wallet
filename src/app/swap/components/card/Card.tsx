import React, { useState, useRef, useMemo } from 'react'
import {
  Box,
  Heading,
  VStack,
  Button,
  Divider,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInput,
  IconButton
} from '@chakra-ui/react'
import { UpDownIcon } from '@chakra-ui/icons'
import { parseEther } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useConfig, useReadContracts, useWriteContract } from 'wagmi'
import { LabelText, TokenPair } from '@/components'
import { JTokenAbi, UniswapV2PairAbi } from '@/contants/Abi'
import { useNotify } from '@/hooks'
import { getAmountOut, getAmountIn } from '@/utils'

import styles from './Card.module.css'

const JTokenContract = {
  abi: JTokenAbi
} as const

const UniswapV2PairContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR as `0x${string}`,
  abi: UniswapV2PairAbi
} as const

interface Token {
  name: string
  address: `0x${string}`
}

const Tokens: [Token, Token] = [
  {
    name: 'TokenA',
    address: process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_A as `0x${string}`
  },
  {
    name: 'TokenB',
    address: process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B as `0x${string}`
  }
]

const Card = () => {
  const [tokens, setTokens] = useState<[Token, Token]>(Tokens)
  const [amountIn, setAmountIn] = useState<string>('1')
  const [amountOut, setAmountOut] = useState<string>('1')
  const [token, setToken] = useState(process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_A)
  const [percent, setPercent] = useState(50)
  const [isPending, setIsPending] = useState(true)
  const tokenPairRef = useRef<{ refetch: any; reserveA: string; reserveB: string }>(null)
  const { notifyError, notifySuccess } = useNotify()
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const config = useConfig()

  const { reserve0, reserve1 } = useMemo(() => {
    if (!tokenPairRef.current) return { reserve0: '0', reserve1: '0' }

    const [token0] = tokens
    if (token0.address === (process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B as `0x${string}`)) {
      return { reserve0: tokenPairRef.current.reserveB, reserve1: tokenPairRef.current.reserveA }
    }

    return { reserve0: tokenPairRef.current.reserveA, reserve1: tokenPairRef.current.reserveB }
  }, [tokens, isPending])

  const handleAmountInChange = (valueAsString: string): void => {
    setAmountIn(valueAsString)
    if (valueAsString) {
      setAmountOut(getAmountOut(valueAsString, reserve0, reserve1))
    } else {
      setAmountOut('0')
    }
  }

  const handleAmountOutChange = (valueAsString: string): void => {
    setAmountOut(valueAsString)
    if (tokenPairRef.current?.reserveA && tokenPairRef.current?.reserveB) {
      if (valueAsString) {
        setAmountIn(getAmountIn(valueAsString, reserve0, reserve1))
      } else {
        setAmountIn('0')
      }
    }
  }

  const { data, isFetching, isFetched, refetch } = useReadContracts({
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
        args: [process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR as `0x${string}`]
      },
      {
        ...JTokenContract,
        address: process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B as `0x${string}`,
        functionName: 'balanceOf',
        args: [process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR as `0x${string}`]
      }
    ]
  })

  // uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
  // uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
  // uint amount0In = 200000000000000000000n > 200000000000000000000n - 2431885259897065639 ? 200000000000000000000n - (200000000000000000000n - 2431885259897065639) : 0;
  // uint amount1In = 100000000000000000000n > 100000000000000000000n - 0 ? 100000000000000000000n - (100000000000000000000n - 0) : 0;

  // 2431885259897065639

  console.log(data)

  const handleSwap = async () => {
    try {
      setIsPending(true)
      let amount0Out = parseEther(amountOut)
      let amount1Out = parseEther('0')
      const [token0] = tokens
      if (token0.address === (process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B as `0x${string}`)) {
        amount0Out = parseEther('0')
        amount1Out = parseEther(amountIn)
      }

      const hash = await writeContractAsync({
        ...UniswapV2PairContract,
        functionName: 'swap',
        args: [amount0Out, amount1Out, address!, '0x']
      })

      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        tokenPairRef.current?.refetch()
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

  const handleSwitch = () => {
    if (amountIn) {
      setAmountOut(getAmountOut(amountIn, reserve1, reserve0))
    } else {
      setAmountOut('0')
    }
    const [token0, token1] = tokens
    setTokens([token1, token0])
  }

  return (
    <>
      <Box className={styles.container}>
        <Heading as="h2" fontSize="2rem" mb={3} className="text-center [text-shadow:_0_4px_0_var(--tw-ring-color)]">
          Swap Token
          <Box as="p" fontSize="16px" mt={5}>
            {process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR}
          </Box>
        </Heading>
        <TokenPair ref={tokenPairRef} callback={setIsPending} />
        <Divider className="mt-2 mb-8" />
        <VStack w="100%" className="gap-4 mx-8">
          <LabelText textAlign="left" width={200} rightWidth="40%" label={`From（${tokens[0].name}）`}>
            <NumberInput
              className="inline-block"
              isDisabled={isPending}
              size="sm"
              w="55%"
              value={amountIn}
              onChange={handleAmountInChange}
              min={1}
              step={1}
              precision={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </LabelText>
          <Box>
            <IconButton aria-label="Swap Token" icon={<UpDownIcon />} onClick={handleSwitch} />
          </Box>
          <LabelText textAlign="left" width={200} rightWidth="40%" label={`To（${tokens[1].name}）`}>
            <NumberInput
              className="inline-block"
              isDisabled={isPending}
              size="sm"
              w="55%"
              value={amountOut}
              onChange={handleAmountOutChange}
              min={1}
              step={1}
              precision={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </LabelText>
          <Button
            variant="ghost"
            onClick={handleSwap}
            isDisabled={Number(amountIn) < 3}
            isLoading={isPending}
            className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
          >
            Swap
          </Button>
        </VStack>
      </Box>
    </>
  )
}

export default Card
