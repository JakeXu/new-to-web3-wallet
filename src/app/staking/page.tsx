'use client'
import { Box, Flex, Divider } from '@chakra-ui/react'
import { Footer, Header, ClaimToken, Staking } from '@/components'

export default function Home() {
  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Header />
      <Box as="main" flex={1} p={4}>
        <ClaimToken />
        <Divider />
        <Staking />
      </Box>
      <Footer />
    </Flex>
  )
}
