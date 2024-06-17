'use client'
import { Box, Text } from '@chakra-ui/react'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => (
  <>
    <Box as="footer" p="1rem" position="sticky" bottom="0" zIndex="10" textAlign="center" className="flex justify-center">
      <div className="flex min-w-0 gap-x-4">
        <Image
          className="h-12 w-12 flex-none rounded-full bg-gray-50"
          width={150}
          height={150}
          src="https://avatars.githubusercontent.com/u/12931714?v=4"
          alt=""
        />
        <div className="min-w-0 flex-auto">
          <p className="text-sm font-semibold leading-6 text-left">Jake Xu</p>
          <p className="mt-1 truncate text-xs leading-5">I&apos;m a curious front-end developer</p>
        </div>
      </div>
    </Box>
    <Text as="p" textAlign="center">
      <Link href="https://github.com/JakeXu/new-to-web3-wallet" target="_blank" rel="noopener noreferrer">
        Don&apos;t forget to leave a ⭐️ on this boilerplate if you like it!
      </Link>
    </Text>
  </>
)

export default Footer
