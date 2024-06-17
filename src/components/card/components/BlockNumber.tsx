import React from 'react'
import { useBlockNumber } from 'wagmi'
import { LabelText } from '@/components'

const BlockNumber = (): React.JSX.Element => {
  const { data } = useBlockNumber({ watch: true })

  return <LabelText label="Block Number" value={data?.toString()} />
}

export default BlockNumber
