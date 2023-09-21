import { Ref, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'

import { Model } from 'pinia-orm'

import { Repository, useRepo } from 'pinia-orm'
import { CollectionResponse } from '../types/CollectionResponse'
import { configState } from '../plugin/configState'

export type OnIndexCallback<ModelType extends Model> = (models: CollectionResponse<ModelType>) => void

export interface UseIndexResourcesOptions<ModelType extends Model = Model> {
  onIndex?: OnIndexCallback<ModelType>
  mockData?: ModelType[]
  immediate?: boolean
  persist?: boolean
  persistBy?: 'save' | 'replace'
}

export interface UseIndexerResourcesReturn<ModelType extends Model = Model> {
  index: (indexOptions?: { page?: number }) => Promise<void>
  indexing: Ref<boolean>
  resources: Ref<Record<string, ModelType>>
  onIndex: (callback: OnIndexCallback<ModelType>) => void
  repo: Repository<ModelType>
}

const defaultOptions = {
  notifyOnError: true,
  persist: true,
  persistBy: 'replace',
}

export default function useIndexResources<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: UseIndexResourcesOptions<InstanceType<ModelType>> = {},
): UseIndexerResourcesReturn<InstanceType<ModelType>> {
  const repo = useRepo<InstanceType<ModelType>>(modelClass)

  const indexing = ref(false)

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const onIndexCallbacks = ref<OnIndexCallback<InstanceType<ModelType>>[]>([])

  if (options.onIndex) {
    onIndexCallbacks.value.push(options.onIndex)
  }

  const onIndex = (callback: OnIndexCallback<InstanceType<ModelType>>) => {
    onIndexCallbacks.value.push(callback)
  }

  const resources: Ref<Record<string, InstanceType<ModelType>>> = useLocalStorage(`useIndexResources:resources.${entity}`, {})

  async function index (): Promise<void> {
    indexing.value = true

    return new Promise((resolve) => {
      setTimeout(() => {
        options.mockData?.forEach(data => {
          const id = data.id ?? uuidv4()

          if (!resources.value[id]) {
            resources.value[id] = data
          }
        })

        if (options.persist) {
          if (options.persistBy === 'replace') {
            repo.flush()
            repo.insert(Object.values(resources.value))
          } else {
            repo[options.persistBy || 'save'](Object.values(resources.value))
          }
        }

        indexing.value = false

        resolve()
      }, configState.mockRequestTimeoutMs)
    })
  }

  if (options.immediate) {
    index()
  }

  return {
    index,
    indexing,
    resources,
    onIndex,
    repo,
  }
}

export { useIndexResources }
