import { RelativeCollection_OrderBy } from '__generated__/graphql'
import { ToggleGroup, ToggleGroupItem, Text } from '../primitives'
import { FC } from 'react'

export type CollectionsTableSortingOption = typeof sortingOptions[number]

const sortingOptions = [
  RelativeCollection_OrderBy.Volume1d,
  RelativeCollection_OrderBy.Volume7d,
  RelativeCollection_OrderBy.Volume1m,
  RelativeCollection_OrderBy.VolumeMax
] as const

const nameForSortingOption = (
  option: CollectionsTableSortingOption,
  compact: boolean
) => {
  switch (option) {
    case RelativeCollection_OrderBy.Volume1d:
      return compact ? '24h' : '24 hours'
    case RelativeCollection_OrderBy.Volume7d:
      return compact ? '7d' : '7 days'
    case RelativeCollection_OrderBy.Volume1m:
      return compact ? '30d' : '30 days'
    case RelativeCollection_OrderBy.VolumeMax:
      return compact ? 'All' : 'All Time'
  }
}

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
