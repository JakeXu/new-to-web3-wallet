import React, { useMemo, useState } from 'react'
import { Box, Heading, VStack, HStack, Spinner } from '@chakra-ui/react'
import { useAccount, useReadContracts } from 'wagmi'
import { LabelText } from '@/components'
import { EIP712TestAbi } from '@/contants/Abi'
import TransferCard from './TransferCard'

import styles from './Card.module.css'

const EIP712TestContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_EIP712TEST as `0x${string}`,
  abi: EIP712TestAbi
} as const

const Card = () => {
  const [hash, setHash] = useState<`0x${string}`>()
  const { address } = useAccount()

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        ...EIP712TestContract,
        functionName: 'amounts',
        args: [address!]
      },
      {
        ...EIP712TestContract,
        functionName: 'nonces',
        args: [address!]
      }
    ]
  })

  const { amount, nonce, r, s, v } = useMemo(() => {
    const amount = data?.[0]?.result ?? 'N/A'
    const nonce = data?.[1]?.result ?? 'N/A'

    const signature = hash?.substring(2) || ''
    const r = '0x' + signature.substring(0, 64)
    const s = '0x' + signature.substring(64, 128)
    const v = parseInt(signature.substring(128, 130), 16)

    return { amount: `${amount}`, nonce: `${nonce}`, r, s, v }
  }, [data, hash])

  const handleRefresh = (hash?: `0x${string}`) => {
    console.log(hash)
    setHash(hash)
    refetch()
  }

  return (
    <>
      <Box className={styles.container}>
        <Heading as="h2" fontSize="2rem" mb={10} className="text-center [text-shadow:_0_4px_0_var(--tw-ring-color)]">
          Test EIP712
          <Box as="p" fontSize="16px" mt={5}>
            {process.env.NEXT_PUBLIC_SEPOLIA_EIP712TEST}
          </Box>
        </Heading>
        <HStack w="100%" height={300}>
          <VStack w="40%" h="100%" className="items-start justify-between m-auto">
            <VStack className="gap-4">
              <LabelText textAlign="left" width={100} label="Amount" value={amount === 'N/A' ? <Spinner size="xs" /> : amount} />
              <LabelText textAlign="left" width={100} label="Nonce" value={nonce === 'N/A' ? <Spinner size="xs" /> : nonce} />
            </VStack>
            <TransferCard nonce={nonce} callback={handleRefresh} />
          </VStack>
          <VStack w="40%" h="100%" className="items-start gap-4 m-auto" overflow="auto">
            {hash && (
              <>
                <LabelText key={hash} textAlign="left" label="R" width={10} isAddress value={r} />
                <LabelText key={hash} textAlign="left" label="S" width={10} isAddress value={s} />
                <LabelText key={hash} textAlign="left" label="V" width={10} value={v} />
              </>
            )}
          </VStack>
        </HStack>
      </Box>
    </>
  )
}

export default Card
