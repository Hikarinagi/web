import { routePattern } from '@hikarinagi/apm-browser'
import { nameRequestRoute } from '../../server/utils/apm-route'

export default defineNuxtPlugin({
  name: 'apm-route',
  setup() {
    const event = useRequestEvent()
    if (!event) return
    nameRequestRoute(event, routePattern(useRouter().currentRoute.value.matched))
  },
})
