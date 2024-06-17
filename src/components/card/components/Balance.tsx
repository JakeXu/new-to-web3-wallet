import React from 'react'
import { useAccount, useBalance } from 'wagmi'
import { LabelText } from '@/components'

const Balance = (): React.JSX.Element => {
  const { address } = useAccount()
  const { data } = useBalance({ address })

  const displayBalance = data?.formatted ? `Ξ ${data?.formatted}` : '0'

  return <LabelText label="Balance" value={displayBalance} />
}

export default Balance
