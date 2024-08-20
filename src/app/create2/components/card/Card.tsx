import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  VStack,
  HStack,
  Select,
  Stack,
  Radio,
  RadioGroup,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Button,
  Kbd,
  Text,
  Spinner,
  Center
} from '@chakra-ui/react'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useConfig, useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import { LabelText } from '@/components'
import { MobileAbi, MobileFactoryAbi } from '@/contants/Abi'
import { useNotify } from '@/hooks'
import { Colors, Displays, Capacities } from '@/contants/types'
import { convertMobileAttribute } from '@/utils'

import styles from './Card.module.css'

const MobileContract = {
  abi: MobileAbi
} as const

const MobileFactoryContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_MOBILEFACTORY as `0x${string}`,
  abi: MobileFactoryAbi
} as const

const Card = () => {
  const [selected, setSelected] = useState('')
  const [color, setColor] = useState('1')
  const [display, setDisplay] = useState('1')
  const [capacity, setCapacity] = useState('1')
  const [isPending, setIsPending] = useState(false)
  const { notifyError, notifySuccess } = useNotify()
  const { data: address, writeContractAsync } = useWriteContract()
  const config = useConfig()

  const {
    data: dataMF,
    isFetching,
    refetch: refetchMF
  } = useReadContract({
    ...MobileFactoryContract,
    functionName: 'getAllMobiles'
  })

  const { data, isFetched, refetch } = useReadContracts({
    contracts: [
      {
        ...MobileContract,
        address: selected as `0x${string}`,
        functionName: 'getMobileInfo'
      },
      {
        ...MobileContract,
        address: selected as `0x${string}`,
        functionName: 'getAllLogs'
      }
    ]
  })

  const { data: mobileHash, refetch: refetchMFV } = useReadContract({
    ...MobileFactoryContract,
    functionName: 'hashMobile',
    args: [BigInt(data?.[0]?.result?.[0] || '1'), BigInt(display), BigInt(capacity), color],
    query: { enabled: false }
  })

  useEffect(() => {
    setColor(data?.[0]?.result?.[1] || '1')
    setDisplay(data?.[0]?.result?.[2].toString() || '1')
    setCapacity(data?.[0]?.result?.[3].toString() || '1')
  }, [selected, isFetched])

  const handleOrder = async () => {
    try {
      setIsPending(true)
      const [p1 = '', p2 = '', p3 = ''] = data?.[0]?.result || []
      const hash = await writeContractAsync({
        ...MobileContract,
        address: selected as `0x${string}`,
        functionName: 'processAction',
        args: [[p1, p2, p3].join('/'), [color, display, capacity].join('/')]
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

  const handleMake = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...MobileFactoryContract,
        functionName: 'makeMobile',
        args: [BigInt(display), BigInt(capacity), color]
      })

      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        setSelected(address!)
        await refetchMF()
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

  const handleVerify = async () => {
    try {
      setIsPending(true)
      await refetchMFV()
      if (mobileHash === selected) {
        notifySuccess({ title: mobileHash as string, message: 'Create2 Hash matched!!!', position: 'bottom' })
      } else {
        notifyError({ title: mobileHash as string, message: 'Create2 Hash mismatched!!!', position: 'bottom' })
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

  const handlePhone = (event: React.ChangeEvent<HTMLSelectElement>) => setSelected(event.target.value)

  return (
    <>
      <Box className={styles.container}>
        <Heading as="h2" fontSize="2rem" mb={10} className="text-center [text-shadow:_0_4px_0_var(--tw-ring-color)]">
          Create2
          <Box as="p" fontSize="16px" mt={5}>
            {process.env.NEXT_PUBLIC_SEPOLIA_MOBILEFACTORY}
          </Box>
        </Heading>
        <HStack w="100%" height={300}>
          {isFetching ? (
            <Center w="100%">
              <Spinner size="xl" />
            </Center>
          ) : (
            <>
              <VStack w="42%" h="100%" className="items-start justify-between m-auto">
                <VStack w="100%" className="gap-4">
                  <Select className="w-full" placeholder="Make a new phone" isDisabled={isPending} value={selected} onChange={handlePhone}>
                    {dataMF
                      ?.map(item => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))
                      .reverse()}
                  </Select>
                  <LabelText textAlign="left" width={100} label="Color">
                    <RadioGroup isDisabled={isPending} onChange={setColor} value={color}>
                      <Stack direction="row">
                        {Object.keys(Colors).map((key: string) => {
                          const color = Colors[key as keyof typeof Colors] as string
                          return (
                            <Radio key={key} colorScheme={color.toLowerCase()} value={key}>
                              {color}
                            </Radio>
                          )
                        })}
                      </Stack>
                    </RadioGroup>
                  </LabelText>
                  <LabelText textAlign="left" width={100} label="Display">
                    <RadioGroup isDisabled={isPending} onChange={setDisplay} value={display}>
                      <Stack direction="row">
                        {Object.keys(Displays).map((key: string) => {
                          const display = Displays[key as keyof typeof Displays] as string
                          return (
                            <Radio key={key} value={key}>
                              {display}
                            </Radio>
                          )
                        })}
                      </Stack>
                    </RadioGroup>
                  </LabelText>
                  <LabelText textAlign="left" width={100} label="Capacity">
                    <RadioGroup isDisabled={isPending} onChange={setCapacity} value={capacity}>
                      <Stack direction="row">
                        {Object.keys(Capacities).map((key: string) => {
                          const capacity = Capacities[key as keyof typeof Capacities] as string

                          return (
                            <Radio key={key} value={key}>
                              {capacity}
                            </Radio>
                          )
                        })}
                      </Stack>
                    </RadioGroup>
                  </LabelText>
                </VStack>
                <HStack w="100%" justify="center">
                  <Button
                    variant="ghost"
                    onClick={selected ? handleOrder : handleMake}
                    isLoading={isPending}
                    className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                  >
                    {selected ? 'Change Order' : 'Make Phone'}
                  </Button>
                  {selected && (
                    <Button
                      variant="solid"
                      onClick={handleVerify}
                      isLoading={isPending}
                      className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                    >
                      Verify Phone
                    </Button>
                  )}
                </HStack>
              </VStack>
              <VStack w="40%" h="100%" className="items-start gap-4 m-auto" overflow="auto">
                <Stepper index={1} orientation="vertical" height={150} gap="0">
                  {data?.[1]?.result?.map(({ from, to, step, time }) => (
                    <Step key={step}>
                      <StepIndicator>
                        <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                      </StepIndicator>
                      <Box flexShrink="0">
                        <StepTitle as="span">
                          <Kbd>{convertMobileAttribute(from)}</Kbd>
                          <Text className="mx-2" as="span" fontSize="xs">
                            =&gt;
                          </Text>
                          <Kbd>{convertMobileAttribute(to)}</Kbd>
                        </StepTitle>
                        <StepDescription className="mt-1 ml-1">{new Date(Number(time.toString())).toLocaleString()}</StepDescription>
                      </Box>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>
              </VStack>
            </>
          )}
        </HStack>
      </Box>
    </>
  )
}

export default Card
