export default defineNuxtRouteMiddleware(() => {
  useNavigationSeq().value += 1
})
