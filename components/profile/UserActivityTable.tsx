import { FC, use, useEffect } from 'react'
import { ActivityTable } from 'components/common/ActivityTable'
import { ActivityType } from '__generated__/graphql'
import { useQuery } from '@apollo/client'
import { GET_ACTIVITIES } from 'graphql/queries/activities'

type Props = {
  user: string | undefined
  activityTypes: ActivityType[]
}

export const UserActivityTable: FC<Props> = ({ user, activityTypes }) => {
  const query = useQuery(GET_ACTIVITIES, {
    variables: {
      skip: 0,
      first: 10,
      where: {
        user: user?.toLowerCase(),
        types: !activityTypes.length ? undefined: activityTypes,
      },
    },
    skip: !user
  })
  useEffect(() => {
    if (user) {
      query.refetch()
    }
  }, [])

  return <ActivityTable query={query} />
}
