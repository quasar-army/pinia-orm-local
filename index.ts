/**
 * Plugin
 */
export { type OrionLocalConfig } from './types/OrionLocalConfig'
export { OrionLocalPlugin } from './plugin/OrionLocalPlugin'

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
export type { UseOrionRestStateManipulator } from './types/UseOrionRestStateManipulator'

/**
 * Other
 */
export { Model } from './types/Model'
export { makeFormFromModel } from './resource/makeFormFromModel'

/**
 * Types
 */
export type { OrionFilter, OrionFilters } from './types/query/OrionFilters'
