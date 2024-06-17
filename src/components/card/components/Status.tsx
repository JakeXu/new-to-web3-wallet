import React from 'react'
import { useAccount } from 'wagmi'
import { LabelText } from '@/components'

const StatusMapping = {
  isConnecting: '🟡 Connecting',
  isConnected: '🟢 Connected',
  default: '⚪️ Disconnected'
}

const Status = (): React.JSX.Element => {
  const { isConnecting, isConnected } = useAccount()

  const status = isConnecting ? StatusMapping.isConnecting : isConnected ? StatusMapping.isConnected : StatusMapping.default

  return <LabelText label="Account Status" value={status} />
}

export default Status
