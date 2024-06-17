import { type ChangeEvent, type MouseEvent, useEffect, useState } from 'react'
import { Button, Input, VStack } from '@chakra-ui/react'
import { useSignInfo, useNotify } from '@/hooks'

const SignCard = () => {
  const { signature, recoveredAddress, error, isPending, signMessage } = useSignInfo()
  const [message, setMessage] = useState('')
  const { notifyError, notifySuccess } = useNotify()

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value.trim())
  }

  const handleSignMessage = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    signMessage({ message })
  }

  useEffect(() => {
    if (signature && recoveredAddress) {
      notifySuccess({
        title: 'Message successfully signed!',
        message: (
          <>
            <b>Signature:</b> {signature}
            <br />
            <br />
            <b>Recovered Address:</b> {recoveredAddress}
          </>
        )
      })
    }

    if (error) {
      notifyError({
        title: 'An error occured:',
        message: error.message
      })
    }
  }, [signature, recoveredAddress, error, notifyError, notifySuccess])

  return (
    <VStack w={'45%'} minWidth={'270px'} gap={2}>
      <Input value={message} onChange={handleMessageChange} type="textarea" placeholder="Enter message to sign" />
      <Button
        variant="ghost"
        onClick={handleSignMessage}
        isDisabled={message.length === 0}
        isLoading={isPending}
        className="w-4/5 border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
      >
        Sign Message
      </Button>
    </VStack>
  )
}

export default SignCard
