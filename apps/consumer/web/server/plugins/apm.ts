import { reportServerError } from '../utils/apm-errors'

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    reportServerError(error, event)
  })
})
