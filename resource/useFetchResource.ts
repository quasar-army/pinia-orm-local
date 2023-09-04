import { ComputedRef, Ref, ref } from 'vue'
import { MaybeComputedRef, MaybeRef, useLocalStorage } from '@vueuse/core'
import { Model } from '../types'
import { ResourceNode } from '../types/ResourceNode'
import { Repository, useRepo } from 'pinia-orm'
import { Filters } from '../types/query/Filters'
import { Aggregate } from '../types/query/Aggregate'
import { configState } from '../plugin/configState'

export type OnFetchCallback<ModelType extends Model> = (resourceNode: ResourceNode<ModelType>) => void

export interface FetchResourceOptions<ModelType extends Model> {
  filters?: MaybeComputedRef<Filters>
  aggregates?: MaybeComputedRef<Aggregate[]>
  id?: MaybeRef<number | string | undefined>
  onFetch?: OnFetchCallback<ModelType>
  immediate?: boolean
  include?: string[]
  notifyOnError?: boolean
  persist?: boolean
  persistBy?: 'save' | 'replace'
}

export interface UseFetchResourceReturn<ModelType extends Model> {
  fetch: (resourceParam?: {
    id: number | string
    attributes: Record<string, unknown>
  } | number | string) => Promise<void>
  repo: Repository<ModelType>
  id: Ref<string | number | null | undefined>
  data: Ref<ResourceNode<ModelType> | null>
  finding: Ref<boolean>
  resource: Ref<ModelType | undefined>
  onFetch: (callback: OnFetchCallback<ModelType>) => void
}

const defaultOptions = {
  persist: true,
  notifyOnError: true,
  persistBy: 'replace',
}

export default function useFetchResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: FetchResourceOptions<InstanceType<ModelType>> = {},
): UseFetchResourceReturn<InstanceType<ModelType>> {
  const repo = useRepo(modelClass)

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const finding = ref(false)

  const idRef = ref(options.id || null)

  const resource: Ref<InstanceType<ModelType> | undefined> = ref()
  const resources: Ref<Record<string, InstanceType<ModelType>>> = useLocalStorage(`useIndexResources:resources.${entity}`, {})

  const onFetchCallbacks = ref<OnFetchCallback<InstanceType<ModelType>>[]>([])

  const onFetch = (callback: OnFetchCallback<InstanceType<ModelType>>) => {
    onFetchCallbacks.value.push(callback)
  }

  if (options.onFetch) {
    onFetchCallbacks.value.push(options.onFetch)
  }

  async function fetch (
    resourceParam?: { id: number | string, attributes: Record<string, unknown> } | number | string,
  ): Promise<void> {
    let fetchId: number | string | undefined

    if (typeof resourceParam === 'number' || typeof resourceParam === 'string') {
      fetchId = resourceParam
    } else if (resourceParam?.id) {
      fetchId = resourceParam?.id
    } else if (typeof idRef.value === 'number' || typeof idRef.value === 'string') {
      fetchId = idRef.value
    }

    if (!fetchId) {
      throw new Error('No id provided: cannot fetch resource without an identifier')
    }

    return new Promise((resolve) => {
      finding.value = true
      resource.value = resources.value[fetchId]

      setTimeout(() => {
        if (options.persist) {
          repo.save(resource.value)
        }

        onFetchCallbacks.value.forEach(callback => callback(resource.value))
        finding.value = false
        resolve()
      }, configState.mockRequestTimeoutMs)
    })
  }

  if (options.immediate && idRef.value) {
    fetch(idRef.value)
  }

  return {
    fetch,
    repo,
    id: idRef,
    filters: options.filters || ref(undefined),
    aggregates: options.aggregates || ref(undefined),
    finding,
    resource,
    onFetch,
  }
}

export { useFetchResource }
