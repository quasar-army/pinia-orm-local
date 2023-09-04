import { OrionComparisonOperator } from './OrionComparisonOperator'

export type OrionFilter = {
  type?: 'and' | 'or'
  field: string
  operator: OrionComparisonOperator
  value: any
} | {
  type: 'and' | 'or'
  nested: OrionFilter[]
}

export type OrionFilters = OrionFilter[]
