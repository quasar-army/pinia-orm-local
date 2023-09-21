import { GetModelsFormKeys } from './GetModelsFormKeys'
import { Model } from 'pinia-orm'

export type ModelForm<ModelType extends Model> = Partial<
  Record<GetModelsFormKeys<ModelType>, any>
>
