import { Model } from 'pinia-orm'
import { Resource } from './Resource'

export interface ResourceNode<ModelType extends Model> {
  data: Resource<ModelType>
}
