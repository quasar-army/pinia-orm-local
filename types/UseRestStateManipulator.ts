import { Collection } from './Collection'
import { Model } from 'pinia-orm'
import { Resource } from './Resource'

export interface UseRestStateManipulator {
  insert: (entity: string, record: Resource<Model> | Collection<Model>) => void
  replace: (entity: string, record: Resource<Model> | Collection<Model>) => void
  remove: (entity: string, record: Resource<Model>) => void
}
