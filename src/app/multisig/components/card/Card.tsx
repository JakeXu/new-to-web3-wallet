import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Heading,
  VStack,
  HStack,
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
  Spinner,
  Center
} from '@chakra-ui/react'
import { parseEther } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import {
  useBalance,
  useConfig,
  useChainId,
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useSignMessage,
  useBlock
} from 'wagmi'
import { LabelText } from '@/components'
import { MultiSigWalletAbi } from '@/contants/Abi'
import { Owner, Hash } from '@/contants/types'
import { useNotify } from '@/hooks'
import { getOwners, getHashes, insertOwnerHash } from '@/app/actions'

import styles from './Card.module.css'

const MultiSigWalletContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_MULTISIGWALLET as `0x${string}`,
  abi: MultiSigWalletAbi
} as const

const TO = process.env.NEXT_PUBLIC_SEPOLIA_MULTISIGWALLET_OWNER2 as `0x${string}`

const Card = () => {
  const [owners, setOwners] = useState<Owner[]>([])
  const [hashes, setHashes] = useState<Map<string, Hash>>(new Map<string, Hash>())
  const [isLoading, setIsloading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const { notifyError, notifySuccess } = useNotify()
  const config = useConfig()
  const { data: multiSigToken } = useBalance({
    address: process.env.NEXT_PUBLIC_SEPOLIA_MULTISIGWALLET as `0x${string}`
  })
  const block = useBlock()
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContractAsync } = useWriteContract()
  const { signMessageAsync } = useSignMessage()

  const loadHashes = async () => {
    const hashMap = new Map<string, Hash>()
    const result = await getHashes()
    result.forEach(item => hashMap.set(item.owner, item))
    setHashes(hashMap)
    setIsloading(false)
  }

  useEffect(() => {
    getOwners().then(result => {
      setOwners(result)
      loadHashes()
    })
  }, [])

  const { data, isFetching, refetch } = useReadContracts({
    contracts: [
      { ...MultiSigWalletContract, functionName: 'nonce' },
      { ...MultiSigWalletContract, functionName: 'threshold' }
    ]
  })

  const {
    data: txHash,
    isFetching: isFetchingTxHash,
    refetch: refetchTxHash
  } = useReadContract({
    ...MultiSigWalletContract,
    functionName: 'encodeTransactionData',
    args: [TO, parseEther('1'), '0x', data?.[0].result!, BigInt(chainId)],
    query: { enabled: false }
  })

  useEffect(() => {
    setIsloading(true)
    refetchTxHash().then(() => setIsloading(false))
  }, [data])

  const { signedOwners, unsignedOwners, signature, doable } = useMemo(() => {
    const signedOwners: Owner[] = []
    const unsignedOwners: Owner[] = []
    const signatures: string[] = []
    let threshold = Number(data?.[1].result?.toString() || 0)
    owners.forEach(owner => {
      const hash = hashes.get(owner.owner)
      if (hash) {
        threshold--
        signatures.push(hash.hash.substring(2))
        signedOwners.push(owner)
      } else {
        unsignedOwners.push(owner)
      }
    })

    return { signedOwners, unsignedOwners, signature: `0x${signatures.join('')}` as `0x${string}`, doable: threshold <= 0 }
  }, [owners, hashes, data])

  const handleSign = async () => {
    try {
      setIsPending(true)
      // 重点，直传hash在合约部分利用ecrecover检查签名会对不上 [{ message: txHash! }]
      const hash = await signMessageAsync({ message: { raw: txHash! } })

      const signature = hash?.substring(2) || ''
      const r = '0x' + signature.substring(0, 64)
      const s = '0x' + signature.substring(64, 128)
      const v = parseInt(signature.substring(128, 130), 16)

      await insertOwnerHash(address!, hash, ((block.data?.timestamp || BigInt(0)) * BigInt(1000)).toString() || '')
      await loadHashes()
      await refetch()

      notifySuccess({
        title: 'Success:',
        message: hash
      })
    } catch (e: any) {
      notifyError({
        title: 'Error:',
        message: e.message
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleTransact = async () => {
    try {
      setIsPending(true)
      const hash = await writeContractAsync({
        ...MultiSigWalletContract,
        functionName: 'execTransaction',
        args: [TO, parseEther('1'), '0x', signature]
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
    <>
      <Box className={styles.container}>
        <Heading as="h2" fontSize="2rem" mb={10} className="text-center [text-shadow:_0_4px_0_var(--tw-ring-color)]">
          Multi-Signature Wallet
          <Box as="p" fontSize="16px" mt={5}>
            {process.env.NEXT_PUBLIC_SEPOLIA_MULTISIGWALLET}
          </Box>
        </Heading>
        <HStack w="100%" height={250}>
          {isFetching || isLoading || isFetchingTxHash ? (
            <Center w="100%">
              <Spinner size="xl" />
            </Center>
          ) : (
            <>
              <VStack w="40%" h="100%" className="items-start gap-4 m-auto" overflow="auto">
                <Stepper index={signedOwners.length} orientation="vertical" height={150} gap="0">
                  {[...signedOwners, ...unsignedOwners].map(({ id, owner }) => {
                    const ownerHash = hashes.get(owner)
                    const time = ownerHash ? new Date(Number(ownerHash.time.toString())).toLocaleString() : '-'
                    return (
                      <Step key={id}>
                        <StepIndicator>
                          <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                        </StepIndicator>
                        <Box flexShrink="0">
                          <StepTitle as="span">
                            <Kbd>{owner}</Kbd>
                          </StepTitle>
                          <StepDescription className="mt-1 ml-1">{time}</StepDescription>
                        </Box>
                        <StepSeparator />
                      </Step>
                    )
                  })}
                </Stepper>
              </VStack>
              <VStack w="50%" h="100%" className="items-start justify-between m-auto">
                <VStack w="100%" className="gap-4">
                  <LabelText isAddress textAlign="left" width={100} label="To" value={TO} />
                  <LabelText textAlign="left" width={100} label="Value" value="1 ETH" />
                  <LabelText textAlign="left" width={100} label="Nonce" value={data?.[0].result?.toString()} />
                  <LabelText textAlign="left" width={100} label="Chain ID" value={chainId} />
                </VStack>
                <HStack w="100%" justify="center">
                  <Button
                    variant="ghost"
                    onClick={handleSign}
                    isLoading={isPending}
                    isDisabled={address ? hashes.has(address) : true}
                    className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                  >
                    Sign
                  </Button>
                  {doable && (
                    <Button
                      variant="solid"
                      onClick={handleTransact}
                      isLoading={isPending}
                      isDisabled={!address || !multiSigToken || !multiSigToken.value}
                      className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                    >
                      Transact
                    </Button>
                  )}
                </HStack>
              </VStack>
            </>
          )}
        </HStack>
        <HStack w="100%">
          <LabelText copyable textAlign="left" width={110} label="Signature" value={signature} />
        </HStack>
      </Box>
    </>
  )
}

export default Card
