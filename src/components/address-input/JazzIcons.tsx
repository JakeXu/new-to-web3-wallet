import { Skeleton } from '@chakra-ui/react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

type JazzIconProps = {
  seed: string
  size?: number
}

const JazzIcon = ({ seed, size }: JazzIconProps) => {
  if (!seed) return <Skeleton height={40} />

  return <Jazzicon seed={jsNumberForAddress(seed)} diameter={size || undefined} />
}

export default JazzIcon
