import { createRequire, register } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)

register(pathToFileURL(require.resolve('@opentelemetry/instrumentation/hook.mjs')))
require('./register.js')
