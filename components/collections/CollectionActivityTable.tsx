import { FC, useEffect } from 'react'
import { ActivityTable } from 'components/common/ActivityTable'
import { ActivityType } from '__generated__/graphql'
import { useQuery } from '@apollo/client'
import { GET_ACTIVITIES } from 'graphql/queries/activities'

type Props = {
  id: string | undefined
  activityTypes: ActivityType[]
}

export const CollectionActivityTable: FC<Props> = ({ id, activityTypes }) => {
  const query = useQuery(GET_ACTIVITIES, {
    variables: {
      skip: 0,
      first: 10,
      where: {
        collection: id,
        types: !activityTypes.length ? undefined: activityTypes,
      },      
    },
    skip: !id
  })

  useEffect(() => {
    if (id) {
      query.refetch()
    }
  }, [])

  return <ActivityTable query={query} />
}
