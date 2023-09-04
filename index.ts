/**
 * Plugin
 */
export { type LocalConfig } from './types/LocalConfig'
export { LocalPlugin } from './plugin/LocalPlugin'

/**
 * Resource
 */
export { useIndexResources, type UseIndexerResourcesReturn, type UseIndexResourcesOptions } from './resource/useIndexResources'
export { useCreateResource } from './resource/useCreateResource'
export { useRemoveResource } from './resource/useRemoveResource'
export { useUpdateResource } from './resource/useUpdateResource'
export { useFetchResource } from './resource/useFetchResource'

/**
 * Contracts
 */
export type { UseRestStateManipulator } from './types/UseRestStateManipulator'

/**
 * Other
 */
export { Model } from './types/Model'
export { makeFormFromModel } from './resource/makeFormFromModel'

/**
 * Types
 */
export type { Filter, Filters } from './types/query/Filters'
