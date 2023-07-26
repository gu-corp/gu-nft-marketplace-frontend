import { RelativeCollection_OrderBy } from '__generated__/graphql'
import { ToggleGroup, ToggleGroupItem, Text } from '../primitives'
import { FC } from 'react'
import useTrans from 'hooks/useTrans'

export type CollectionsTableSortingOption = typeof sortingOptions[number]

const sortingOptions = [
  RelativeCollection_OrderBy.Volume1d,
  RelativeCollection_OrderBy.Volume7d,
  RelativeCollection_OrderBy.Volume1m,
  RelativeCollection_OrderBy.VolumeMax
] as const

type Props = {
  compact?: boolean
  option: CollectionsTableSortingOption
  onOptionSelected: (option: CollectionsTableSortingOption) => void
}

const CollectionsTableTimeToggle: FC<Props> = ({
  compact = false,
  option,
  onOptionSelected,
}) => {
  const trans = useTrans()
  const nameForSortingOption = (
    option: CollectionsTableSortingOption,
    compact: boolean
  ) => {
    switch (option) {
      case RelativeCollection_OrderBy.Volume1d:
        return compact ? '24h' : trans.home._24_hours
      case RelativeCollection_OrderBy.Volume7d:
        return compact ? '7d' : trans.home._7_days
      case RelativeCollection_OrderBy.Volume1m:
        return compact ? '30d' : trans.home._30_days
      case RelativeCollection_OrderBy.VolumeMax:
        return compact ? 'All' : trans.home.all_time
    }
  }
  return (
    <ToggleGroup
      type="single"
      value={option}
      onValueChange={(value) => {
        onOptionSelected(value as CollectionsTableSortingOption)
      }}
      css={{ maxWidth: 'max-content' }}
    >
      {sortingOptions.map((optionItem) => (
        <ToggleGroupItem
          key={optionItem}
          value={optionItem}
          disabled={optionItem === option}
          css={{ py: '$3' }}
        >
          <Text style="subtitle1">
            {nameForSortingOption(optionItem, compact)}
          </Text>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default CollectionsTableTimeToggle
