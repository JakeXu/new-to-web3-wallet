import { SunIcon, MoonIcon } from '@chakra-ui/icons'
import { Button, useColorMode } from '@chakra-ui/react'

const ColorModeButton = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Button
      w={10}
      h={10}
      onClick={toggleColorMode}
      className="border border-stone-400 rounded-full hover:shadow-[0_0_8px_8px_rgba(30,136,229,0.2)]"
    >
      {colorMode === 'light' ? <SunIcon fontSize={20} /> : <MoonIcon fontSize={18} />}
    </Button>
  )
}

export default ColorModeButton
