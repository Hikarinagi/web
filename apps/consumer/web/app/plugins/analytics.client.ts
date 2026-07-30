export default defineNuxtPlugin({
  name: 'analytics',
  setup() {
    onNuxtReady(async () => {
      const config = await hikariRequest('/api/v3/site/analytics', { toast: false }).catch(
        () => null,
      )
      if (!config) return

      if (config.openpanel) {
        const { OpenPanel } = await import('@openpanel/web')
        new OpenPanel({
          clientId: config.openpanel.client_id,
          apiUrl: config.openpanel.api_url,
          trackScreenViews: true,
          trackOutgoingLinks: true,
          trackAttributes: true,
        })
      }

      if (config.rybbit) {
        const { default: rybbit } = await import('@rybbit/js')
        await rybbit.init({
          siteId: config.rybbit.site_id,
          analyticsHost: config.rybbit.host,
        })
      }
    })
  },
})
