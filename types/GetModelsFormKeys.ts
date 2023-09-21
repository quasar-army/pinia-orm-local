import { RemoveIndex } from 'src/shared/types/RemoveIndex'
import { Model } from 'pinia-orm'

export type GetModelsFormKeys<T extends Model> =
  keyof Omit<
    RemoveIndex<T>,
    keyof RemoveIndex<InstanceType<typeof Model>>
  >
