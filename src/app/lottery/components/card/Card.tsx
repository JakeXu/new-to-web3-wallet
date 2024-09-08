import React, { useState, useEffect, useMemo, memo, CSSProperties } from 'react'
import { useDebounce } from 'ahooks'
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Collapse,
  Center,
  Input,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  IconButton,
  Flex,
  Spacer,
  Image,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  PinInput,
  PinInputField,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  ListItem,
  UnorderedList,
  useDisclosure
} from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon, ArrowBackIcon, ArrowForwardIcon, RepeatClockIcon } from '@chakra-ui/icons'
import { parseEther, formatEther } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useBlock, useConfig, useAccount, useReadContract, useWriteContract } from 'wagmi'
import { LotteryAbi, LotteryNFTAbi } from '@/contants/Abi'
import { useNotify } from '@/hooks'
import { LottoInfo, LottoStatus } from '@/contants/types'

import styles from './Card.module.css'

const OWNER = process.env.NEXT_PUBLIC_SEPOLIA_LOTTERY_OWNER as `0x${string}`

const NFT_URI = 'https://bronze-wooden-tern-205.mypinata.cloud/ipfs/QmaChABG53yS2UnJusmGaZyJk6SYkdxFVogyThyzAe99v1'

const LatestIcon = (
  <svg viewBox="0 0 24 24" color="currentColor" width="1em" focusable="false" className="chakra-icon inline-block">
    <path d="M3 13.1835H14.17L9.29 18.0635C8.9 18.4535 8.9 19.0935 9.29 19.4835C9.68 19.8735 10.31 19.8735 10.7 19.4835L17.29 12.8935C17.68 12.5035 17.68 11.8735 17.29 11.4835L10.71 4.88347C10.32 4.49347 9.69 4.49347 9.3 4.88347C8.91 5.27347 8.91 5.90347 9.3 6.29347L14.17 11.1835H3C2.45 11.1835 2 11.6335 2 12.1835C2 12.7335 2.45 13.1835 3 13.1835Z"></path>
    <path d="M20 5.18347C20.5523 5.18347 21 5.63119 21 6.18347V18.1835C21 18.7358 20.5523 19.1835 20 19.1835C19.4477 19.1835 19 18.7358 19 18.1835V6.18347C19 5.63119 19.4477 5.18347 20 5.18347Z"></path>
  </svg>
)

const Colors = ['#60a5fa', '#f87171', '#facc15', '#c084fc', '#a3e635', '#f472b6', '#22d3ee', '#e879f9', '#4ade80', '#fb7185']

const Ball = memo(({ color, value }: { color: string; value: React.ReactNode }) => {
  const multiplyMode: CSSProperties = { mixBlendMode: 'multiply' }
  const softLightMode: CSSProperties = { mixBlendMode: 'soft-light' }
  const transform = `rotate(${(Math.random() - Math.random()) * 30}deg)`

  return (
    <Box w="72px" h="72px" mx={1} position="relative">
      <svg viewBox="0 0 32 32" width="100%" height="100%" color="text" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill={color}></circle>
        <g opacity="0.1" style={multiplyMode}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24.3428 3.13232C28.9191 8.87177 28.5505 17.2573 23.2373 22.5706C17.528 28.2799 8.27148 28.2799 2.56223 22.5706C2.2825 22.2909 2.01648 22.0026 1.76416 21.7067C4.02814 27.3486 9.54881 31.3326 16 31.3326C24.4683 31.3326 31.3332 24.4677 31.3332 15.9994C31.3332 10.6078 28.5504 5.8661 24.3428 3.13232Z"
            fill="black"
          ></path>
        </g>
        <g opacity="0.1" style={multiplyMode}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M25.7713 4.18262C30.6308 10.2119 30.2607 19.061 24.6609 24.6608C19.0615 30.2602 10.2132 30.6307 4.18396 25.7722C6.99643 29.1689 11.2455 31.3329 16 31.3329C24.4683 31.3329 31.3332 24.468 31.3332 15.9997C31.3332 11.2446 29.1687 6.99508 25.7713 4.18262Z"
            fill="black"
          ></path>
        </g>
        <g style={softLightMode}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.48969 24.8677C0.151051 18.7651 0.974979 11.0636 6.01931 6.01927C11.0639 0.974682 18.7659 0.15093 24.8687 3.49016C22.365 1.71201 19.3046 0.666603 16 0.666603C7.53165 0.666603 0.666733 7.53152 0.666733 15.9998C0.666733 19.3041 1.7119 22.3642 3.48969 24.8677Z"
            fill="white"
          ></path>
        </g>
        <g style={softLightMode}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.10075 9.5143C3.77271 5.93677 6.78528 3.11129 10.4921 1.68422C10.546 1.73235 10.5987 1.78219 10.6502 1.83374C12.4838 3.66728 10.9119 5.7442 8.66145 7.99465C6.411 10.2451 4.33417 11.8169 2.50064 9.98335C2.35338 9.83609 2.22013 9.6793 2.10075 9.5143Z"
            fill="white"
          ></path>
        </g>
      </svg>
      <Text as="div" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
        <Text
          as="div"
          transform={transform}
          fontSize={44}
          fontWeight={600}
          textShadow="white -0.75px -0.75px 0px, white 0.75px -0.75px 0px, white -0.75px 0.75px 0px, white 0.75px 0.75px 0px"
        >
          {value}
        </Text>
      </Text>
    </Box>
  )
})
Ball.displayName = 'Ball'

const MatchItem = memo(({ index, lottoInfo }: { index: number; lottoInfo: LottoInfo }) => {
  const { costPerTicket = BigInt(0), winningDistribution = [] } = lottoInfo
  const count = winningDistribution[index] || 0
  const prizeAmount = costPerTicket * BigInt(count)

  return (
    <Flex flexDirection="column" gap={2}>
      <Heading className="text-purple-500" size="md">
        {`Match first ${index + 1}`}
      </Heading>
      <Text className="text-slate-600">{`~${formatEther(prizeAmount)}ETH`}</Text>
      <Text className="text-slate-600">{`${count} Winning Tickets`}</Text>
    </Flex>
  )
})
MatchItem.displayName = 'MatchItem'

const LotteryContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_LOTTERY as `0x${string}`,
  abi: LotteryAbi
} as const

const LotteryNFTContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_LOTTERY_NFT as `0x${string}`,
  abi: LotteryNFTAbi
} as const

const LotteryCard = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  const { isOpen: isPopoverOpen, onToggle: onPopoverToggle, onClose: onPopoverClose } = useDisclosure()
  const [winningNumbers, setWinningNumbers] = useState('')
  const [lotteryId, setLotteryId] = useState('1')
  const [isPending, setIsPending] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const { notifyError, notifySuccess } = useNotify()
  const { data: { timestamp = BigInt(0) } = {}, isFetching: isFetchingBlock } = useBlock()
  const config = useConfig()
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const debouncedLotteryId = useDebounce(lotteryId, { wait: 1000 })

  const {
    data: latestLotteryId = '0',
    isFetching: isFetchingLotteryId,
    refetch: refetchLotteryId
  } = useReadContract({
    ...LotteryContract,
    functionName: 'lotteryId'
  })

  const {
    data: tickets,
    isFetching: isFetchingTickets,
    refetch: refetchTickets
  } = useReadContract({
    ...LotteryNFTContract,
    functionName: 'getUserTickets',
    args: [BigInt(lotteryId), address!]
  })

  const { data, isFetching, refetch } = useReadContract({
    ...LotteryContract,
    functionName: 'getLottoInfo',
    args: [BigInt(lotteryId)],
    query: { enabled: false }
  })

  useEffect(() => {
    setLotteryId(latestLotteryId.toString())
  }, [latestLotteryId])

  useEffect(() => {
    refetch()
  }, [debouncedLotteryId])

  const { colorIndex, isDisabledPre, isDisabledNext, isDisabledLatest, lottoInfo, isCompleted, isOwner } = useMemo(() => {
    const isDisabledPre = BigInt(lotteryId) <= BigInt(1) || isFetching || isFetchingLotteryId
    const isDisabledNext = BigInt(lotteryId) === BigInt(latestLotteryId) || isFetching || isFetchingLotteryId
    const isDisabledLatest = isDisabledNext
    const lottoInfo = data as unknown as LottoInfo
    const isCompleted = lottoInfo ? LottoStatus.options[lottoInfo.lotteryStatus] === LottoStatus.enum.Completed : false
    const isOwner = address === OWNER

    return {
      colorIndex: (Number(lotteryId) % 2) * 5,
      isDisabledPre,
      isDisabledNext,
      isDisabledLatest,
      lottoInfo,
      isCompleted,
      isOwner
    }
  }, [lotteryId, latestLotteryId, isFetching, isFetchingLotteryId, data, address])

  const handleBuy = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...LotteryContract,
        functionName: 'buyLottoTicket',
        args: [winningNumbers.split('').map(Number)],
        value: parseEther('0.1')
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
      setWinningNumbers('')
      setIsBuying(false)
      setIsPending(false)
    }
  }

  const handleDraw = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...LotteryContract,
        functionName: 'drawWinningNumbers',
        args: [BigInt(lotteryId), BigInt(`${Math.random() * Math.pow(10, 17)}`)]
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
      setWinningNumbers('')
      setIsBuying(false)
      setIsPending(false)
    }
  }

  const handleLotto = async () => {
    try {
      setIsPending(true)
      const startTS = timestamp + BigInt(2 * 60 * 60)
      const closeTS = startTS + BigInt(5 * 24 * 60 * 60)
      const hash = await writeContractAsync({
        ...LotteryContract,
        functionName: 'createNewLotto',
        args: [[5, 10, 15, 25, 45], BigInt(100000000000000000), startTS, closeTS]
      })

      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        await refetchLotteryId()
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
      setWinningNumbers('')
      setIsBuying(false)
      setIsPending(false)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setLotteryId(event.target.value)

  const handlePre = () => setLotteryId((BigInt(lotteryId) - BigInt(1)).toString())

  const handleNext = () => setLotteryId((BigInt(lotteryId) + BigInt(1)).toString())

  const handleLatest = () => setLotteryId(latestLotteryId.toString())

  const handleModal = () => setIsBuying(!isBuying)

  const handleWinningNumbers = (v: string) => setWinningNumbers(v)

  const handleClaimModal = () => setIsClaiming(!isClaiming)

  const handlePopover = async () => {
    await refetchTickets()
    onPopoverToggle()
  }

  return (
    <>
      <Box className={styles.container}>
        <Heading as="h2" fontSize="2rem" mb={10} className="text-center [text-shadow:_0_4px_0_var(--tw-ring-color)]">
          Five-Digit Lottery
          <Box as="p" fontSize="16px" mt={5}>
            {process.env.NEXT_PUBLIC_SEPOLIA_LOTTERY}
          </Box>
        </Heading>
        <HStack w="100%">
          <VStack w="100%" className="gap-4 m-auto" overflow="auto">
            <Skeleton isLoaded={!(isFetchingLotteryId || isFetching || isFetchingBlock)}>
              <Card variant="outline" w="100%">
                <CardHeader>
                  <HStack>
                    <Box as="span" position="relative" overflow="hidden" className="mx-2">
                      <Image boxSize="100px" objectFit="cover" src={NFT_URI} alt="Lottery" title="From IPFS" />
                      <Text as="span" className={styles.badge} fontSize="xs">
                        0.1ETH
                      </Text>
                    </Box>
                    <VStack w="100%" alignItems="flex-start">
                      <Flex w="100%" minWidth="max-content" alignItems="center" gap="0">
                        <Box>
                          <Flex minWidth="max-content" alignItems="center" gap="4">
                            <Heading size="md">Round</Heading>
                            <Input variant="filled" size="sm" htmlSize={4} width="auto" value={lotteryId} onChange={handleChange} />
                            {isOwner && (
                              <Button
                                variant="solid"
                                size="sm"
                                onClick={handleLotto}
                                isLoading={isPending}
                                className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                              >
                                New Lotto
                              </Button>
                            )}
                          </Flex>
                        </Box>
                        <Spacer />
                        <IconButton
                          onClick={handlePre}
                          isDisabled={isDisabledPre}
                          variant="unstyled"
                          aria-label="Pre Lottery"
                          icon={<ArrowBackIcon />}
                        />
                        <IconButton
                          onClick={handleNext}
                          isDisabled={isDisabledNext}
                          variant="unstyled"
                          aria-label="Next Lottery"
                          icon={<ArrowForwardIcon />}
                        />
                        <IconButton
                          onClick={handleLatest}
                          isDisabled={isDisabledLatest}
                          variant="unstyled"
                          aria-label="Latest Lottery"
                          icon={LatestIcon}
                        />
                      </Flex>
                      <Flex w="100%" minWidth="max-content" alignItems="center" gap="0">
                        {lottoInfo && (
                          <Box
                            mt={2}
                          >{`Drawn ${new Date(Number((lottoInfo.closingTimestamp * BigInt(1000)).toString())).toLocaleString()}`}</Box>
                        )}
                        <Spacer />
                        {isOwner && (
                          <Button
                            variant="solid"
                            size="sm"
                            onClick={handleLotto}
                            isLoading={isPending}
                            className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                          >
                            Withdraw All
                          </Button>
                        )}
                      </Flex>
                    </VStack>
                  </HStack>
                </CardHeader>
                <Divider />
                <CardBody position="relative" overflow="hidden">
                  <Flex alignItems="center">
                    <Flex alignItems="center" gap="2">
                      <Box p="2">
                        <Heading size="md">Winning Number</Heading>
                      </Box>
                      {isCompleted ? (
                        <>
                          {Array.from(new Array(5).keys()).map(value => (
                            <Ball key={value} color={Colors[colorIndex + value]} value={lottoInfo.winningNumbers[value]} />
                          ))}
                        </>
                      ) : (
                        <Text className="ml-44">Coming soon...</Text>
                      )}
                    </Flex>
                    <Spacer />
                    {isCompleted ? (
                      <Button
                        variant="solid"
                        onClick={handleClaimModal}
                        isLoading={isPending}
                        className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                      >
                        Claim Reward
                      </Button>
                    ) : (
                      <HStack>
                        {isOwner && (
                          <Button
                            variant="solid"
                            onClick={handleDraw}
                            isLoading={isPending}
                            isDisabled={timestamp < (lottoInfo?.closingTimestamp || timestamp)}
                            className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                          >
                            Draw Winning Numbers
                          </Button>
                        )}
                        <Button
                          variant="solid"
                          onClick={handleModal}
                          isLoading={isPending}
                          isDisabled={
                            isFetching ||
                            isFetchingLotteryId ||
                            isCompleted ||
                            LottoStatus.options[lottoInfo?.lotteryStatus] !== LottoStatus.enum.Open ||
                            timestamp >= (lottoInfo?.closingTimestamp || timestamp)
                          }
                          className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                        >
                          Buy Ticket
                        </Button>
                      </HStack>
                    )}
                  </Flex>
                </CardBody>
                <Divider />
                <CardFooter padding="1rem">
                  <Box w="100%">
                    {lottoInfo && (
                      <Collapse in={isOpen} animateOpacity>
                        <Flex alignItems="flex-start" gap="16">
                          <VStack alignItems="flex-start">
                            <Heading size="md">Prize pot</Heading>
                            <Heading className="text-purple-700" size="lg">
                              {`~${formatEther(lottoInfo.prizePool)}ETH`}
                            </Heading>
                          </VStack>
                          <VStack alignItems="flex-start">
                            <Text mb={6}>Match the winning number in the same order to share prizes.</Text>
                            <Flex flexWrap="wrap" gap="8">
                              <MatchItem index={0} lottoInfo={lottoInfo} />
                              <MatchItem index={1} lottoInfo={lottoInfo} />
                              <MatchItem index={2} lottoInfo={lottoInfo} />
                              <MatchItem index={3} lottoInfo={lottoInfo} />
                              <MatchItem index={4} lottoInfo={lottoInfo} />
                            </Flex>
                          </VStack>
                        </Flex>
                      </Collapse>
                    )}
                    <Box mt={isOpen ? 4 : 0}>
                      <Center>
                        <Button
                          rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          colorScheme="teal"
                          variant="unstyled"
                          onClick={onToggle}
                        >
                          {isOpen ? 'Hide' : 'Details'}
                        </Button>
                      </Center>
                    </Box>
                  </Box>
                </CardFooter>
              </Card>
            </Skeleton>
          </VStack>
        </HStack>
      </Box>
      <Modal isOpen={isBuying} onClose={handleModal}>
        <ModalOverlay />
        <ModalContent alignItems="center">
          <ModalBody p={6}>
            <FormControl>
              <FormLabel textAlign="center" fontSize={32}>
                Winning Numbers
              </FormLabel>
              <HStack>
                <PinInput size="lg" onChange={handleWinningNumbers}>
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="solid"
              onClick={handleBuy}
              isLoading={isPending}
              isDisabled={isFetchingLotteryId || winningNumbers.length < 5}
              className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
            >
              Buy Instantly
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isClaiming} onClose={handleClaimModal}>
        <ModalOverlay />
        <ModalContent alignItems="center">
          <ModalBody p={6}>
            <FormControl>
              <FormLabel textAlign="center" fontSize={32}>
                Ticket IDs
              </FormLabel>
              <HStack>
                <PinInput size="lg" onChange={handleWinningNumbers}>
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="solid"
              onClick={handleBuy}
              isLoading={isPending}
              isDisabled={isFetchingLotteryId || winningNumbers.length < 5}
              className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
            >
              Claim Instantly
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Popover isOpen={isPopoverOpen} onClose={onPopoverClose}>
        <PopoverTrigger>
          <Button
            top="10rem"
            right="10rem"
            position="fixed"
            leftIcon={<RepeatClockIcon />}
            isDisabled={isFetchingTickets}
            onClick={handlePopover}
          >
            Your tickets
          </Button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody padding="2rem">
              {tickets?.length ? (
                <UnorderedList>{tickets?.map((ticket, index) => <ListItem key={index}>{ticket.toString()}</ListItem>)}</UnorderedList>
              ) : (
                <Text>Pls buy your tickets now!</Text>
              )}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  )
}

export default LotteryCard
