import { reportServerError } from '../utils/apm-errors'
import { matchedRoutePattern, nameRequestRoute } from '../utils/apm-route'

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('beforeResponse', event => {
    nameRequestRoute(event, matchedRoutePattern(event))
  })
  nitroApp.hooks.hook('error', (error, { event }) => {
    reportServerError(error, event)
  })
})
