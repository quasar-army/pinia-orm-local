import { Repository, useRepo } from 'pinia-orm'
import { ComputedRef, Ref, ref } from 'vue'
import { Model } from 'pinia-orm'
import { ResourceNode } from '../types/ResourceNode'
import { useLocalStorage } from '@vueuse/core'
import { configState } from '../plugin/configState'

export type OnRemoveCallback<ModelType extends Model> = (model: ResourceNode<ModelType>) => void

export interface RemoveResourceOptions<ModelType extends Model> {
  id?: string | number
  onRemove?: OnRemoveCallback<ModelType>
  notifyOnError?: boolean
  persist?: boolean
}

export interface UseRemoveResourceReturn<ModelType extends Model> {
  id: Ref<string | number | null>
  remove: (resourceParam?: number | {
      id: number | string;
  } | undefined) => Promise<void>
  repo: Repository<ModelType>
  removing: ComputedRef<string | number | false | null>
  resource: Ref<ModelType | undefined>
  onRemove: (callback: OnRemoveCallback<ModelType>) => void
}

const defaultOptions = {
  notifyOnError: true,
  persist: true,
}

export default function useRemoveResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: RemoveResourceOptions<InstanceType<ModelType>> = {},
): UseRemoveResourceReturn<InstanceType<ModelType>> {
  const repo = useRepo(modelClass)

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const resources: Ref<Record<string, InstanceType<ModelType>>> = useLocalStorage(`useIndexResources:resources.${entity}`, {})
  const resource: Ref<InstanceType<ModelType> | undefined> = ref()
  const id = ref(options.id || null)

  const removing = ref<string | number>('')

  const onRemoveCallbacks = ref<OnRemoveCallback<InstanceType<ModelType>>[]>([])

  if (options.onRemove) {
    onRemoveCallbacks.value.push(options.onRemove)
  }

  const onRemove = (callback: OnRemoveCallback<InstanceType<ModelType>>) => {
    onRemoveCallbacks.value.push(callback)
  }

  async function remove (resourceParam?: number | string | { id: number | string }) {
    if (resourceParam) {
      id.value = typeof resourceParam === 'number'
        ? resourceParam
        : resourceParam.id
    }

    removing.value = id.value ?? ''

    return new Promise((resolve) => {
      setTimeout(() => {
        resource.value = repo.find(id.value)
        repo.destroy(id.value)
        delete resources.value[id.value]

        removing.value = ''

        onRemoveCallbacks.value.forEach(callback => callback(resource.value))
        resolve()
      }, configState.mockRequestTimeoutMs)
    })
  }

  return {
    id,
    remove,
    removing,
    repo,
    resource,
    onRemove,
  }
}

export { useRemoveResource }
