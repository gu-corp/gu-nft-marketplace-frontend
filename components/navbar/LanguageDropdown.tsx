import { FC } from 'react'
import { Dropdown, DropdownMenuItem } from 'components/primitives/Dropdown'
import {
  Box,
  Button,
  Flex,
  Text,
} from 'components/primitives'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import useTrans from 'hooks/useTrans'

export const LanguageDropdown: FC = () => {
  const router = useRouter()
  const trans = useTrans()

  const changeLang = (lang: "en" | "ja") => {
    router.push('/', '/', { locale: lang })
  }
  
  const trigger = (
    <Button
      css={{
        justifyContent: 'center',
      }}
      corners="circle"
      type="button"
      color="gray3"
    >
      <FontAwesomeIcon icon={faGlobe} width={16} height={16} />
    </Button>
  )

  const children = (
    <>
      <DropdownMenuItem onClick={() => changeLang("ja")}>
        <Text style="body1">{trans.nav.japanese}</Text>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => changeLang("en")}>
        <Text style="body1">{trans.nav.english}</Text>
      </DropdownMenuItem>
    </>
  )

  return (
    <Dropdown
      trigger={trigger}
      contentProps={{ style: { width: '150px', marginTop: '8px' } }}
    >{children}</Dropdown>
  )
}
