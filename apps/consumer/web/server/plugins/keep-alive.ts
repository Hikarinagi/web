import { serverOf, tuneKeepAlive } from '../utils/keep-alive'

export default defineNitroPlugin(nitroApp => {
  let tuned = false
  nitroApp.hooks.hook('request', event => {
    if (tuned) return
    const server = serverOf(event.node.req)
    if (!server) return
    tuneKeepAlive(server)
    tuned = true
  })
})
