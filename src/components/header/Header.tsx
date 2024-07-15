'use client'
import { HStack, Heading, Link as ChakraLink, Menu, MenuButton, IconButton, MenuList, MenuItem } from '@chakra-ui/react'
import { HamburgerIcon, RepeatIcon, ArrowLeftIcon } from '@chakra-ui/icons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import Link from 'next/link'

import { useWindowSize } from '@/hooks'

import { ColorModeButton } from '../color-mode-button'

const Header = () => {
  const { isTablet } = useWindowSize()

  return (
    <HStack as="header" p="1.5rem" position="sticky" top={0} zIndex={10} justifyContent="space-between">
      <HStack>
        <Image src="/assets/logos/wallet.svg" alt="logo" width={45} height={45} />
        {!isTablet && (
          <>
            <Heading as="h1" fontSize="1.5rem" className="text-shadow">
              <Link href="https://github.com/JakeXu/new-to-web3-wallet" target="_blank" rel="noopener noreferrer">
                New To Web3 Wallet
              </Link>
            </Heading>
            <Menu>
              <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="outline" />
              <MenuList>
                <ChakraLink as={Link} href="/">
                  <MenuItem icon={<ArrowLeftIcon />}>Home</MenuItem>
                </ChakraLink>
                <ChakraLink as={Link} href="/staking">
                  <MenuItem icon={<RepeatIcon />}>Claim & Staking JAK</MenuItem>
                </ChakraLink>
              </MenuList>
            </Menu>
          </>
        )}
      </HStack>

      <HStack>
        <ConnectButton />
        <ColorModeButton />
      </HStack>
    </HStack>
  )
}

export default Header
