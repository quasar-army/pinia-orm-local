import { Filters } from './Filters'

export type Aggregate = 'count' |
  'avg' |
  'sum' |
  'min' |
  'max' |
  'exists'

export interface Aggregate {
  type: Aggregate
  relation: string
  field?: string
  filters?: Filters
}

export const aggregates: Aggregate[] = [
  'count',
  'avg',
  'sum',
  'min',
  'max',
  'exists',
]
