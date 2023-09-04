import { Model, Relation } from 'pinia-orm'
import nonFormProps from '../constants/nonFormProps'
import { PiniaOrmForm } from 'pinia-orm-helpers'

export function makeFormFromModel (
  model: Model,
): PiniaOrmForm<Model> {
  const fields = model.$fields()
  const fieldKeys = Object.entries(fields)
    .filter(entry => !(entry[1] instanceof Relation))
    .map(entry => entry[0])

  const result = {}

  fieldKeys.forEach(field => {
    if (!nonFormProps.includes(field)) {
      result[field] = model[field]
    }
  })

  return result
}
