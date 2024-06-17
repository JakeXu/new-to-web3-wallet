import { Text, type BoxProps } from '@chakra-ui/react'

interface LabelTextProps extends BoxProps {
  label: string
  value: string | undefined
}

const LabelText = ({ label, value = 'N/A', ...props }: LabelTextProps) => (
  <Text {...props}>
    <Text as="span" textAlign="right" className="inline-block mr-6" width={200} fontSize={20} fontWeight="800">
      {`${label}: `}
    </Text>
    <Text as="span">{value}</Text>
  </Text>
)

export default LabelText
