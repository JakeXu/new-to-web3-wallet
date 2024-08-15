import { useState } from 'react'
import {
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  useToast
} from '@chakra-ui/react'
import { useSignTypedData, useChainId, useAccount } from 'wagmi'
import { EIP712TypeDefinition, EIP712Domain } from '@/contants/types'

interface TransferCardProps {
  nonce: string
  callback: (hash?: `0x${string}`) => void
}

const TransferCard = ({ nonce, callback }: TransferCardProps) => {
  const [amount, setAmount] = useState<string>('1')
  const [isPending, setIsPending] = useState(false)
  const chainId = useChainId()
  const { isConnected, address } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
  const toast = useToast()

  const handleAmountChange = (valueAsString: string): void => {
    setAmount(valueAsString)
  }

  const handleTransfer = async () => {
    const types: EIP712TypeDefinition = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Test: [
        { name: 'owner', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    }

    const domain: EIP712Domain = {
      name: 'jake',
      version: '1',
      chainId,
      verifyingContract: process.env.NEXT_PUBLIC_SEPOLIA_EIP712TEST as `0x${string}`
    }

    try {
      setIsPending(true)
      const hash = await signTypedDataAsync({
        types,
        domain,
        primaryType: 'Test',
        message: {
          owner: address,
          amount,
          nonce
        }
      })
      const signature = hash.substring(2)
      const r = '0x' + signature.substring(0, 64)
      const s = '0x' + signature.substring(64, 128)
      const v = parseInt(signature.substring(128, 130), 16)
      console.log(r, s, v)
      callback(hash)
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

  const handleRefresh = () => {
    handleAmountChange('1')
    callback()
  }

  return (
    <HStack w="100%">
      <NumberInput w="55%" value={amount} min={1} onChange={handleAmountChange} step={1} precision={0}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button
        variant="ghost"
        onClick={handleTransfer}
        isDisabled={!isConnected}
        isLoading={isPending}
        className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
      >
        Approve
      </Button>
      <Button
        variant="ghost"
        onClick={handleRefresh}
        isLoading={isPending}
        isDisabled={!isConnected}
        className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
      >
        Refresh
      </Button>
    </HStack>
  )
}

export default TransferCard
