import { vTooltip } from '@hina-ui/vue'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('tooltip', vTooltip)
})
