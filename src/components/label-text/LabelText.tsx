import { ReactNode, useEffect } from 'react'
import { Text, type BoxProps, useClipboard } from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { useNotify } from '@/hooks'
import { getEllipsisWords } from '@/utils'

interface LabelTextProps extends BoxProps {
  label?: string
  value: ReactNode | string
  isAddress?: boolean
  copyable?: boolean
}

const LabelText = ({
  label = '',
  value = 'N/A',
  textAlign = 'right',
  width = 200,
  isAddress = false,
  copyable = isAddress,
  ...props
}: LabelTextProps) => {
  const { onCopy, setValue, hasCopied } = useClipboard(typeof value === 'string' ? value : '')
  const { notifySuccess } = useNotify()
  let v = value
  if (isAddress) v = getEllipsisWords(v as `0x${string}`, 16)

  useEffect(() => {
    if (typeof value === 'string' && copyable) setValue(value as string)
  }, [value, copyable])

  const handleCopy = () => {
    onCopy()
    notifySuccess({ title: '', message: value, position: 'bottom', containerStyle: { wordBreak: 'keep-all', maxWidth: '100%' } })
  }

  return (
    <Text {...props}>
      {label && (
        <Text as="span" textAlign={textAlign} className="inline-block mr-6" width={width} fontSize={20} fontWeight="800">
          {`${label}: `}
        </Text>
      )}
      <Text as="span">{v}</Text>
      {copyable && <CopyIcon className="ml-1 cursor-pointer" _hover={{ color: 'pink' }} onClick={handleCopy} />}
    </Text>
  )
}

export default LabelText
