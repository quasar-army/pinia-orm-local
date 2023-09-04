import { Ref, ref } from 'vue'
import { Model } from '../types/Model'
import { Repository, useRepo } from 'pinia-orm'
import { GetModelsFormKeys } from '../types/GetModelsFormKeys'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { useLocalStorage } from '@vueuse/core'
import { configState } from '../plugin/configState'
import { v4 as uuidv4 } from 'uuid'

export type OnCreateCallback = () => void

export interface CreateResourceOptions<ModelType extends Model> {
  formDefaults?: () => Record<string, unknown>
  onCreate?: OnCreateCallback
  optimistic?: boolean
  notifyOnError?: boolean
  persist?: boolean
}

export interface UseCreateResourceReturn<ModelType extends Model> {
  create: (form?: PiniaOrmForm<ModelType>) => Promise<void>
  repo: Repository<ModelType>
  form: Ref<PiniaOrmForm<ModelType>>
  resetForm: () => void
  formDefaults: Ref<() => PiniaOrmForm<ModelType>>
  creating: Ref<boolean>
  resource: Ref<ModelType | undefined>
  onCreate: (callback: OnCreateCallback) => void
}

const defaultOptions = {
  persist: true,
}

export default function useCreateResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: CreateResourceOptions<InstanceType<ModelType>> = {},
): UseCreateResourceReturn<InstanceType<ModelType>> {
  const repo = useRepo(modelClass)

  const entity = modelClass.entity
  options = Object.assign({}, defaultOptions, options)

  const creating = ref(false)

  const formDefaults = ref(options.formDefaults || (() => { return {} }))
  const resource: Ref<InstanceType<ModelType> | undefined> = ref()
  const resources: Ref<Record<string, InstanceType<ModelType>>> = useLocalStorage(`useIndexResources:resources.${entity}`, {})

  const onCreateCallbacks: Ref<OnCreateCallback[]> = ref([])
  const form: Ref<Partial<Record<GetModelsFormKeys<InstanceType<ModelType>>, any>>> = ref({})

  function resetForm () {
    form.value = {}
  }

  if (options.onCreate) {
    onCreateCallbacks.value.push(options.onCreate)
  }

  const onCreate = (callback: OnCreateCallback) => {
    onCreateCallbacks.value.push(callback)
  }

  async function create (
    formParam?: PiniaOrmForm<InstanceType<ModelType>>,
  ): Promise<void> {
    creating.value = true

    const mergedForm = Object.assign({}, form.value, formDefaults.value(), formParam || {})

    const id = mergedForm.id ?? uuidv4()
    if (!mergedForm.id) (mergedForm.id = id)

    return new Promise((resolve) => {
      setTimeout(() => {
        if (options.persist) {
          resources.value[id] = mergedForm
          repo.save(mergedForm)
        }
        creating.value = false

        resource.value = mergedForm
        onCreateCallbacks.value.forEach(callback => callback())
        resolve()
      }, configState.mockRequestTimeoutMs)
    })
  }

  return {
    create,
    formDefaults,
    resetForm,
    repo,
    form,
    creating,
    resource,
    onCreate,
  }
}

export { useCreateResource }
