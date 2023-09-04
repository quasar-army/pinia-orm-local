import { App } from 'vue'
import { OrionLocalConfig } from '../types/OrionLocalConfig'
import { configState } from './configState'

export const OrionLocalPlugin = {
  install: (app: App, options: OrionLocalConfig): void => {
    Object.assign(configState, options)
  },
}
