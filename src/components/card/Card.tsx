import { useState } from 'react'
import { Box, Button, Divider, Flex, Heading } from '@chakra-ui/react'
import { useAccount, useChainId, useConfig, useBlock } from 'wagmi'
import ReactJson from 'react-json-view'
import { Status, Address, Chain as C1, Balance, BlockNumber, TransferCard, SignCard } from './components'

import styles from './Card.module.css'

const Card = () => {
  const [shown, setShown] = useState(false)
  const { isConnected, address } = useAccount()
  const block = useBlock()

  const fetchTransactions = async () => setShown(!shown)

  return (
    <>
      <Box className={styles.container}>
        <Heading as="h2" fontSize="2rem" mb={10} className="text-center [text-shadow:_0_4px_0_var(--tw-ring-color)]">
          Wallet Info
        </Heading>
        <Flex className="flex-col items-start gap-4 w-4/5 m-auto">
          <Status />
          {isConnected && (
            <>
              <Address />
              <C1 />
              <Balance />
              <Flex w="100%" display="flex" justifyContent="space-between" flexWrap="wrap">
                <BlockNumber />
                <Button
                  onClick={fetchTransactions}
                  variant="ghost"
                  className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                >
                  {shown ? 'Hide' : 'Show'} block info
                </Button>
              </Flex>
              <Divider mb={1} />
              <Flex w="100%" display="flex" justifyContent="space-around" flexWrap="wrap" gap={5}>
                <SignCard />
                <TransferCard />
              </Flex>
            </>
          )}
        </Flex>
        {shown && (
          <>
            <Divider mt={4} mb={2} />
            <div className="m-4">
              <ReactJson
                name={false}
                style={{ wordBreak: 'break-all' }}
                src={JSON.parse(
                  JSON.stringify(
                    block.data,
                    (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
                  )
                )}
              />
            </div>
          </>
        )}
      </Box>
    </>
  )
}

export default Card
