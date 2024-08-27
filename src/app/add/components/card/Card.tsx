import React, { useState, useRef } from 'react'
import {
  Box,
  Heading,
  VStack,
  Stack,
  Radio,
  RadioGroup,
  Button,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInput,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark
} from '@chakra-ui/react'
import { parseEther } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { LabelText, TokenPair } from '@/components'
import { JTokenAbi, UniswapV2PairAbi } from '@/contants/Abi'
import { useNotify } from '@/hooks'

import styles from './Card.module.css'

const JTokenContract = {
  abi: JTokenAbi
} as const

const UniswapV2PairContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR as `0x${string}`,
  abi: UniswapV2PairAbi
} as const

const Card = () => {
  const [amount, setAmount] = useState<string>('1')
  const [token, setToken] = useState(process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_A)
  const [percent, setPercent] = useState(50)
  const [isPending, setIsPending] = useState(false)
  const tokenPairRef = useRef(null)
  const { notifyError, notifySuccess } = useNotify()
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const config = useConfig()

  const handleAmountChange = (valueAsString: string): void => {
    setAmount(valueAsString)
  }

  const handlePair = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...JTokenContract,
        address: token as `0x${string}`,
        functionName: 'transfer',
        args: [process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR as `0x${string}`, parseEther(amount)]
      })

      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        tokenPairRef.current?.refetch()
        setAmount('1')
        notifySuccess({
          title: 'Success:',
          message: hash,
          position: 'bottom'
        })
      }
    } catch (e: any) {
      notifyError({
        title: 'Error:',
        message: e.message,
        position: 'bottom'
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleCalcLiquidity = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...UniswapV2PairContract,
        functionName: 'mint',
        args: [address!]
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

  const handleRemoveLiquidity = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...UniswapV2PairContract,
        functionName: 'transfer',
        args: [
          process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR as `0x${string}`,
          (BigInt(tokenPairRef.current?.balance || 0) * BigInt(percent)) / BigInt(100)
        ]
      })

      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        tokenPairRef.current?.refetch()
        setAmount('1')
        notifySuccess({
          title: 'Success:',
          message: hash,
          position: 'bottom'
        })
      }
    } catch (e: any) {
      notifyError({
        title: 'Error:',
        message: e.message,
        position: 'bottom'
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleRemovePair = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...UniswapV2PairContract,
        functionName: 'burn',
        args: [address!]
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

  return (
    <>
      <Box className={styles.container}>
        <Heading as="h2" fontSize="2rem" mb={3} className="text-center [text-shadow:_0_4px_0_var(--tw-ring-color)]">
          Add Liquidity
          <Box as="p" fontSize="16px" mt={5}>
            {process.env.NEXT_PUBLIC_SEPOLIA_UNISWAPV2PAIR}
          </Box>
        </Heading>
        <TokenPair ref={tokenPairRef} />
        <Divider className="mt-2 mb-4" />
        <Tabs>
          <TabList>
            <Tab isDisabled={isPending}>Add Token</Tab>
            <Tab isDisabled={isPending}>Calc Liquidity</Tab>
            <Tab isDisabled={isPending}>Remove Liquidity</Tab>
            <Tab isDisabled={isPending}>Back Token</Tab>
          </TabList>
          <TabPanels>
            <TabPanel className="pt-8">
              <VStack w="100%" className="gap-4">
                <LabelText textAlign="left" width={100} label="Token">
                  <RadioGroup isDisabled={isPending} onChange={setToken} value={token}>
                    <Stack direction="row">
                      <Radio value={process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_A}>A</Radio>
                      <Radio value={process.env.NEXT_PUBLIC_SEPOLIA_JTOKEN_B}>B</Radio>
                    </Stack>
                  </RadioGroup>
                </LabelText>
                <LabelText textAlign="left" width={100} label="Value">
                  <NumberInput
                    isDisabled={isPending}
                    size="xs"
                    w="55%"
                    value={amount}
                    onChange={handleAmountChange}
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
                  onClick={handlePair}
                  isLoading={isPending}
                  className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                >
                  Add to Pair
                </Button>
              </VStack>
            </TabPanel>
            <TabPanel className="pt-8">
              <VStack w="100%">
                <Button
                  variant="ghost"
                  onClick={handleCalcLiquidity}
                  isLoading={isPending}
                  className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                >
                  Calc Liquidity
                </Button>
              </VStack>
            </TabPanel>
            <TabPanel className="pt-8">
              <Slider isDisabled={isPending} onChange={setPercent}>
                <SliderMark value={25}>25%</SliderMark>
                <SliderMark value={50}>50%</SliderMark>
                <SliderMark value={75}>75%</SliderMark>
                <SliderMark value={percent} textAlign="center" bg="blue.500" color="white" mt="-10" ml="-5" w="12">
                  {percent}%
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <VStack className="mt-6" w="100%">
                <Button
                  variant="ghost"
                  onClick={handleRemoveLiquidity}
                  isLoading={isPending}
                  className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                >
                  Remove Liquidity
                </Button>
              </VStack>
            </TabPanel>
            <TabPanel className="pt-8">
              <VStack w="100%">
                <Button
                  variant="ghost"
                  onClick={handleRemovePair}
                  isLoading={isPending}
                  className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                >
                  Back Token
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  )
}

export default Card
