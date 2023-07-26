import { Box, Flex, Switch, Text } from 'components/primitives'
import { FC } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { CollapsibleContent } from 'components/primitives/Collapsible'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHand,
  faRightLeft,
  faShoppingCart,
  IconDefinition,
  faCartPlus,
  faStar,
  faBan
} from '@fortawesome/free-solid-svg-icons'
import { ActivityType } from '__generated__/graphql'
import useTrans from 'hooks/useTrans'

type ActivityTypes = ActivityType[]

type Filters = {
  type: ArrayItemTypes<ActivityTypes>
  name: string
  icon: IconDefinition
}[]

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  activityTypes: NonNullable<ActivityTypes>
  setActivityTypes: (activityTypes: ActivityTypes) => void
}

export const ActivityFilters: FC<Props> = ({
  open,
  setOpen,
  activityTypes,
  setActivityTypes,
}) => {
  const trans = useTrans()
  const filters: Filters = [
    {
      type: ActivityType.ListingEvent,
      name: trans.collection.listings,
      icon: faCartPlus,
    },
    {
      type: ActivityType.MintEvent,
      name: trans.collection.mints,
      icon: faStar,
    },
    {
      type: ActivityType.NftTransferEvent,
      name: trans.collection.transfers,
      icon: faRightLeft,
    },
    {
      type: ActivityType.SaleEvent,
      name: trans.collection.sales,
      icon: faShoppingCart,
    },
    {
      type: ActivityType.OfferEvent,
      name: trans.collection.offers,
      icon: faHand,
    },
    {
      type: ActivityType.CancelListingEvent,
      name: trans.collection.canceled_listings,
      icon: faBan,
    },
    {
      type: ActivityType.CancelOfferEvent,
      name: trans.collection.cancel_offers,
      icon: faBan,
    },
  ]
  return (
    <Collapsible.Root
      open={open}
      key="hi"
      onOpenChange={setOpen}
      style={{
        transition: 'width .5s',
        width: open ? 320 : 0,
      }}
    >
      <CollapsibleContent
        css={{
          position: 'sticky',
          top: 16 + 80,
          height: 'max-content',
          overflow: 'auto',
        }}
      >
        <Flex
          direction="column"
          css={{
            '& > div:first-of-type': {
              pt: 0,
            },
          }}
        >
          <Text style="subtitle1" css={{ mb: '$4', whiteSpace: 'nowrap' }}>
            {trans.collection.event_type}
          </Text>
          {filters.map((filter) => (
            <Flex
              key={filter.type}
              css={{ mb: '$3', gap: '$3' }}
              align="center"
            >
              <Box css={{ color: '$gray11' }}>
                <FontAwesomeIcon icon={filter.icon} width={16} height={16} />
              </Box>
              <Text
                style="body1"
                css={{
                  flex: 1,
                }}
              >
                {filter.name}
              </Text>
              <Flex align="center">
                <Switch
                  checked={activityTypes?.includes(filter.type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setActivityTypes([...activityTypes, filter.type])
                    } else {
                      setActivityTypes(
                        activityTypes.filter((item) => {
                          return item != filter.type
                        })
                      )
                    }
                  }}
                />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </CollapsibleContent>
    </Collapsible.Root>
  )
}
