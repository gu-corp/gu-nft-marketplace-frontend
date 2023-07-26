import { NextPage } from 'next'
import { Text, Flex, Box } from 'components/primitives'
import Layout from 'components/Layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import useTrans from 'hooks/useTrans'

const IndexPage: NextPage = () => {
  const trans = useTrans()
  return (
    <Layout>
      <Flex
        direction="column"
        align="center"
        css={{ py: '200px', px: '$3', textAlign: 'center' }}
      >
        <Box css={{ color: '$gray11', mb: '30px' }}>
          <FontAwesomeIcon icon={faFolderOpen} size="2xl" />
        </Box>
        <Text style="body1" color="subtle" css={{ mb: '$1' }}>
          {trans._404._404_error}.
        </Text>
        <Text style="body1" color="subtle">
          {trans._404.the_requested_url_was_not_found_on_the_server}.
        </Text>
      </Flex>
    </Layout>
  )
}

export default IndexPage
