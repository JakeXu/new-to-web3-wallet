'use client'
import { Box, Flex } from '@chakra-ui/react'
import { Footer, Header } from '@/components'
import { Card } from './components'

export default function Swap() {
  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Header />
      <Box as="main" flex={1} p={4}>
        <Card />
      </Box>
      <Footer />
    </Flex>
  )
}
