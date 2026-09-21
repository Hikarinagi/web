import { loadPresets, optionsFromEnv, presetsFromEnv } from './env'
import { startNodeTelemetry } from './index'

const options = optionsFromEnv(process.env)
if (options) {
  startNodeTelemetry({ ...options, instrumentations: loadPresets(presetsFromEnv(process.env)) })
}
