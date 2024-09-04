import React, { useState, useEffect, useMemo } from 'react'
import { Box, Heading, VStack, HStack, Button, Spinner, Center, Image, Divider, Card, CardBody, CardFooter, Text } from '@chakra-ui/react'
import { parseEther } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useConfig, useAccount, useReadContract, useWriteContract } from 'wagmi'
import { PinataSDK } from 'pinata'
import { faker } from '@faker-js/faker'
import { UglyAvatarsAbi } from '@/contants/Abi'
import { useNotify } from '@/hooks'
import { sleep } from '@/utils'
import { NFT } from '@/contants/types'
import { Points } from '@/app/erc721/types'
import { Avatar, Props } from '../avatar'
import {
  randomFromInterval,
  generateFaceContourPoints,
  generateBothEyes,
  generateHairLines0,
  generateHairLines1,
  generateHairLines2,
  generateHairLines3,
  generateMouthShape0,
  generateMouthShape1,
  generateMouthShape2
} from '../../utils'

import styles from './Card.module.css'

const UglyAvatarsContract = {
  address: process.env.NEXT_PUBLIC_SEPOLIA_UGLYAVATARS as `0x${string}`,
  abi: UglyAvatarsAbi
} as const

const Owner = process.env.NEXT_PUBLIC_SEPOLIA_ERC721_OWNER as `0x${string}`

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY
})

const AvatarCard = () => {
  const [avatar, setAvatar] = useState<Props>()
  const [list, setList] = useState<NFT[]>([])
  const [isLoading, setIsloading] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { notifyError, notifySuccess } = useNotify()
  const config = useConfig()
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const {
    data: tokenId,
    isFetching,
    refetch: refetchTokenId
  } = useReadContract({
    ...UglyAvatarsContract,
    functionName: 'totalSupply'
  })

  const loadPinataFiles = async () => {
    try {
      setIsloading(true)
      const files = await pinata.listFiles().name('.json')

      const result = await Promise.all(
        files.map(async ({ ipfs_pin_hash }) => {
          const { data } = await pinata.gateways.get(ipfs_pin_hash)
          return { id: ipfs_pin_hash, ...(data as JSON) } as unknown as NFT
        })
      )

      setList(result)
    } finally {
      setIsloading(false)
    }
  }

  const loadAvatar = () => {
    // Face
    const faceContourPoints = generateFaceContourPoints()
    const { face, width, height } = faceContourPoints

    // Hair
    const numHairLines = []
    const numHairMethods = 4
    for (let i = 0; i < numHairMethods; i++) {
      numHairLines.push(Math.floor(randomFromInterval(0, 50)))
    }
    let hairLines: Points[] = []
    if (Math.random() > 0.3) {
      hairLines = generateHairLines0(face, numHairLines[0] * 1 + 10)
    }
    if (Math.random() > 0.3) {
      hairLines = hairLines.concat(generateHairLines1(face, numHairLines[1] / 1.5 + 10))
    }
    if (Math.random() > 0.5) {
      hairLines = hairLines.concat(generateHairLines2(face, numHairLines[2] * 3 + 10))
    }
    if (Math.random() > 0.5) {
      hairLines = hairLines.concat(generateHairLines3(face, numHairLines[3] * 3 + 10))
    }

    // Mouth
    let mouthPoints: Points = []
    const choice = Math.floor(Math.random() * 3)
    if (choice == 0) {
      mouthPoints = generateMouthShape0(height, width)
    } else if (choice == 1) {
      mouthPoints = generateMouthShape1(height, width)
    } else {
      mouthPoints = generateMouthShape2(height, width)
    }

    setAvatar({ faceContourPoints, bothEyes: generateBothEyes(width / 2), hairLines, mouthPoints })
  }

  useEffect(() => {
    loadAvatar()
    loadPinataFiles()
  }, [])

  const { isOwner } = useMemo(() => {
    return { isOwner: address === Owner }
  }, [address])

  const handleAnother = async () => {
    try {
      setIsPending(true)
      loadAvatar()
      await sleep(400)
    } catch (e: any) {
    } finally {
      setIsPending(false)
    }
  }

  const handleMint = async () => {
    const pinata = new PinataSDK({
      pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
      pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY
    })

    try {
      setIsPending(true)
      const svg = document.getElementById('face-svg')!
      const svgContent = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      const svgFile = new File([svgBlob], `${tokenId}.svg`, { type: 'image/svg+xml' })
      const { IpfsHash } = await pinata.upload.file(svgFile)

      const name = faker.commerce.productName()
      const description = faker.commerce.productDescription()
      const image = `ipfs://${IpfsHash}`

      const { IpfsHash: jsonIpfsHash } = await pinata.upload
        .json({
          name,
          description,
          image
        })
        .addMetadata({ name: `${tokenId}.json` })

      const hash = await (isOwner
        ? writeContractAsync({
            ...UglyAvatarsContract,
            functionName: 'safeMint',
            args: [Owner, `ipfs://${jsonIpfsHash}`]
          })
        : writeContractAsync({
            ...UglyAvatarsContract,
            functionName: 'mintNFT',
            args: [Owner, `ipfs://${jsonIpfsHash}`],
            value: parseEther('0.15')
          }))

      const done = await waitForTransactionReceipt(config, { hash })

      if (done) {
        await refetchTokenId()
        await loadPinataFiles()
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
          Ugly Avatar
          <Box as="p" fontSize="16px" mt={5}>
            {process.env.NEXT_PUBLIC_SEPOLIA_UGLYAVATARS}
          </Box>
        </Heading>
        <HStack w="100%">
          <VStack w="100%" className="gap-4 m-auto" overflow="auto">
            <Card maxW="sm">
              <CardBody padding={0} position="relative" overflow="hidden">
                {isFetching ? (
                  <Center w="320px" h="320px">
                    <Spinner size="xl" />
                  </Center>
                ) : (
                  avatar && (
                    <Box as="span">
                      <Avatar {...avatar} />
                      {!isOwner && (
                        <Text as="span" className={styles.badge} fontSize="xs">
                          0.15ETH
                        </Text>
                      )}
                    </Box>
                  )
                )}
              </CardBody>
              <Divider />
              <CardFooter padding="1rem">
                <HStack w="100%" justify="center">
                  <Button
                    variant="ghost"
                    onClick={handleAnother}
                    isLoading={isPending}
                    isDisabled={isFetching}
                    className="border border-stone-400 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                  >
                    Another
                  </Button>
                  <Button
                    variant="solid"
                    onClick={handleMint}
                    isLoading={isPending}
                    isDisabled={isFetching}
                    className="border bg-blue-200 rounded-[20px] hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
                  >
                    Mint
                  </Button>
                </HStack>
              </CardFooter>
            </Card>
          </VStack>
        </HStack>
        <Divider />
        <Center>
          <Text className="my-4" fontSize="xl">
            Top 10 Sold
          </Text>
        </Center>
        <HStack w="100%" overflowY="hidden">
          {isLoading ? (
            <Center w="100%" className="mt-4">
              <Spinner size="xl" />
            </Center>
          ) : (
            <>
              {list.map(avatar => {
                const { id, name, image } = avatar
                return (
                  <Box key={id} as="span" position="relative" overflow="hidden">
                    <Image
                      boxSize="100px"
                      objectFit="cover"
                      src={image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                      alt={name}
                      title={id}
                    />
                    <Text as="span" className={styles.badge} fontSize="xs">
                      SALE
                    </Text>
                  </Box>
                )
              })}
            </>
          )}
        </HStack>
      </Box>
    </>
  )
}

export default AvatarCard
