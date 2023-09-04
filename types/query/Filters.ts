import { ComparisonOperator } from './ComparisonOperator'

export type Filter = {
  type?: 'and' | 'or'
  field: string
  operator: ComparisonOperator
  value: any
} | {
  type: 'and' | 'or'
  nested: Filter[]
}

export type Filters = Filter[]
