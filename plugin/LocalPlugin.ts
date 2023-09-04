import { App } from 'vue'
import { LocalConfig } from '../types/LocalConfig'
import { configState } from './configState'

export const LocalPlugin = {
  install: (app: App, options: LocalConfig): void => {
    Object.assign(configState, options)
  },
}
