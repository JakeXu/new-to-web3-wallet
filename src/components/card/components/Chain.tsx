import React from 'react'
import { useAccount } from 'wagmi'
import { LabelText } from '@/components'

const Chain = (): React.JSX.Element => {
  const { chain } = useAccount()

  const chainInfo = `${chain?.name} [ ${chain?.id} ]`

  return <LabelText label="Chain" value={chainInfo} />
}

export default Chain
