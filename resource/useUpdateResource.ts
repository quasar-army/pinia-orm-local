import { Ref, ref } from 'vue'
import { MaybeRef, useLocalStorage } from '@vueuse/core'
import { Model } from '../types'
import { ResourceNode } from '../types/ResourceNode'
import { Item, Relation, useRepo } from 'pinia-orm'
import useFetchResource from './useFetchResource'
import nonFormProps from '../constants/nonFormProps'
import { GetModelsFormKeys } from '../types/GetModelsFormKeys'
import { configState } from '../plugin/configState'
import deepEqual from 'deep-equal'
import { cloneDeep } from 'lodash-es'

export type OnUpdateCallback<ModelType extends Model> = (model: ResourceNode<ModelType>) => void

export interface UpdateResourceOptions<ModelType extends Model> {
  form?: Partial<Record<GetModelsFormKeys<ModelType>, any>>
  id?: MaybeRef<string | number | undefined>
  makeFormWithId?: string | number
  onUpdate?: OnUpdateCallback<ModelType>
  notifyOnError?: boolean
  persist?: boolean
}

const defaultOptions = {
  notifyOnError: true,
  persist: true,
}

export default function useUpdateResource<ModelType extends typeof Model> (
  modelClass: ModelType,
  options: UpdateResourceOptions<InstanceType<ModelType>> = {},
) {
  options = Object.assign({}, defaultOptions, options)
  const repo = useRepo(modelClass)
  const entity = modelClass.entity

  const updating = ref(false)

  const form: Ref<Partial<Record<GetModelsFormKeys<InstanceType<ModelType>>, any>>> = ref(options.form || {})
  const resource: Ref<InstanceType<ModelType> | undefined> = ref()
  const resources: Ref<Record<string, InstanceType<ModelType>>> = useLocalStorage(`useIndexResources:resources.${entity}`, {})
  const id = ref(options.id || null)

  const onUpdateCallbacks: Ref<OnUpdateCallback<InstanceType<ModelType>>[]> = ref([])

  if (options.onUpdate) {
    onUpdateCallbacks.value.push(options.onUpdate)
  }

  const resourceFetcher = useFetchResource(modelClass)

  const findingModelForUpdate = ref(false)

  function makeFormFromModel (model: Item<Model>) {
    if (!model) { return }
    const fields = model.$fields()
    const fieldKeys = Object.entries(fields)
      .filter(entry => !(entry[1] instanceof Relation))
      .map(entry => entry[0])

    fieldKeys.forEach(field => {
      if (!nonFormProps.includes(field)) {
        form.value[field] = cloneDeep(model[field])
      }
    })
  }

  async function makeFormWithId (targetId: string | number) {
    id.value = targetId
    const foundModel = repo.find(targetId)
    makeFormFromModel(foundModel)
  }

  if (options.makeFormWithId) {
    makeFormWithId(options.makeFormWithId)
  }

  const onUpdate = (callback: OnUpdateCallback<InstanceType<ModelType>>) => {
    onUpdateCallbacks.value.push(callback)
  }

  function getFormsChangedValues () {
    const oldResource = repo.find(id.value)
    const newResource = form.value
    const resourceChangedValuesOnly: Record<string, any> = {}

    Object.entries(newResource).forEach(([key, value]) => {
      if (!deepEqual(oldResource[key], newResource[key])) {
        resourceChangedValuesOnly[key] = value
      }
    })
    return resourceChangedValuesOnly
  }

  async function update (
    idParam?: number | string, attributes: Record<string, unknown> = {},
  ): Promise<void> {
    if (idParam) (id.value = idParam)

    if (!id.value) {
      throw new Error('Cannot update without an id')
    }

    const mergedForm = Object.assign({}, form.value, attributes, { id: id.value })
    form.value = mergedForm

    const formChangedValues = getFormsChangedValues(mergedForm)

    return new Promise((resolve) => {
      setTimeout(() => {
        if (options.persist) {
          const originalValue = resources.value[id.value]
          resources.value[id.value] = Object.assign(originalValue, formChangedValues)
          repo.save(mergedForm)
        }
        updating.value = false

        resource.value = mergedForm
        onUpdateCallbacks.value.forEach(callback => callback(mergedForm))
        resolve()
      }, configState.mockRequestTimeoutMs)
    })
  }

  return {
    id,
    update,
    form,
    makeFormWithId,
    updating,
    resource,
    findingModelForUpdate,
    repo,
    onUpdate,
  }
}

export { useUpdateResource }
