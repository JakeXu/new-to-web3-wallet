'use client'
import { useState, useMemo } from 'react'
import { Button, HStack, useToast, Alert, AlertIcon, Link } from '@chakra-ui/react'
import { useChainId, useAccount, useReadContract, useWriteContract } from 'wagmi'
import { sepolia } from 'viem/chains'
import { AirdropAbi, TOKEN_SYMBOL } from '@/contants/Abi'
import { walletClient4Sepolia } from '@/utils'

const ClaimToken = () => {
  const chainId = useChainId()
  const [txHash, setTxHash] = useState('')
  const [adding, setAdding] = useState(false)
  const toast = useToast()
  const { address } = useAccount()

  const { writeContract } = useWriteContract()

  const { data } = useReadContract({
    abi: AirdropAbi,
    address: process.env.NEXT_PUBLIC_SEPOLIA_AIRDROP as `0x${string}`,
    functionName: 'isClaimed',
    args: [address!]
  })

  const { isClaimed, isSepolia, isDisabled } = useMemo(() => {
    const isSepolia = chainId === sepolia.id
    const isDisabled = !window?.ethereum
    return { isClaimed: (data ?? (!txHash || !window?.ethereum)) || !isSepolia, isSepolia, isDisabled }
  }, [data, chainId, txHash])

  const handleClaim = () => {
    writeContract(
      {
        abi: AirdropAbi,
        address: process.env.NEXT_PUBLIC_SEPOLIA_AIRDROP as `0x${string}`,
        functionName: 'withdrawTokens'
      },
      {
        onSuccess: setTxHash,
        onError: error => {
          toast({
            title: error.toString(),
            status: 'error',
            isClosable: true
          })
        }
      }
    )
  }

  const handleJAK2Wallet = async () => {
    try {
      setAdding(true)
      // wallet_watchAsset
      const success = await walletClient4Sepolia?.watchAsset({
        type: 'ERC20',
        options: {
          address: process.env.NEXT_PUBLIC_SEPOLIA_JAK_TOKEN as `0x${string}`,
          decimals: 18,
          symbol: TOKEN_SYMBOL
        }
      })

      if (success) {
        toast({
          title: 'Successfully added JAK to wallet',
          status: 'success',
          isClosable: true
        })
      } else {
        toast({
          title: 'Failed to add JAK to wallet',
          status: 'error',
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
      setAdding(false)
    }
  }

  return (
    <>
      {isDisabled && (
        <div className="mt-10 flex justify-center">
          <Alert className="w-9/12" status="warning">
            <AlertIcon />
            Your browser does not seem to have MetaMask installed.
            <Link className="m-1" as="a" href="https://support.metamask.io/" target="_blank" rel="noopener noreferrer">
              Please install it.
            </Link>
          </Alert>
        </div>
      )}
      <div className="rounded-full border-2 border-fuchsia-600 m-10">
        <div className="flex px-40 py-10 gap-4">
          <div className="grid grid-rows-3 grid-flow-col gap-4 w-8/12">
            <div className="p-4 rounded-lg shadow-lg bg-fuchsia-500 grid place-content-center row-span-3 text-8xl">{TOKEN_SYMBOL}</div>
            <div className="p-4 rounded-lg bg-fuchsia-400 grid place-content-center row-span-2 col-span-2 dark:bg-fuchsia-800 dark:text-fuchsia-400 text-4xl">
              {TOKEN_SYMBOL} Tokens Online Now!
            </div>
            <div className="p-4 rounded-lg shadow-lg bg-fuchsia-300 grid place-content-center col-span-2 justify-start">
              Contract Address: {process.env.NEXT_PUBLIC_SEPOLIA_JAK_TOKEN}
            </div>
          </div>
          <div className="w-4/12 pl-4">
            <HStack className="h-full" gap={8} align="center" justify="center">
              <Button
                onClick={handleClaim}
                isDisabled={isClaimed}
                className="rounded-3xl text-2xl p-10"
                colorScheme="purple"
                variant="outline"
              >
                Claim {TOKEN_SYMBOL}
              </Button>
              <Button
                onClick={handleJAK2Wallet}
                isDisabled={adding || isDisabled || !isSepolia}
                className="rounded-3xl text-2xl p-10"
                colorScheme="purple"
                variant="outline"
              >
                Add {TOKEN_SYMBOL} to Wallet
              </Button>
            </HStack>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClaimToken
