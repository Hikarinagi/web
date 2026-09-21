<script setup lang="ts">
  import { Center, Link, Spinner, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { usePlaygroundAuth } from '~/features/developer/usePlaygroundAuth'
  import type { DevelopersGuidePageData } from '~~/server/api/pages/developers/guide.get'

  defineOptions({ name: 'DevelopersPlaygroundCallbackPage' })
  definePageMeta({ footer: false, bottomBar: false })

  const route = useRoute()
  const failure = ref('')
  const { complete } = usePlaygroundAuth()

  useHikariSeoMeta({ title: '授权回调', noindex: true })

  onMounted(async () => {
    const guide = await $fetch<DevelopersGuidePageData>('/api/pages/developers/guide')
    const result = await complete({
      tokenEndpoint: guide.token_endpoint,
      query: new URLSearchParams(window.location.search),
    })
    if (!result.ok) {
      failure.value = result.message
      return
    }
    await navigateTo(result.returnTo ?? '/developers/api', { replace: true })
  })

  const back = computed(() => (route.query.from as string) || '/developers/api')
</script>

<template>
  <Center class="min-h-[60vh]">
    <Stack gap="sm" align="center">
      <template v-if="failure">
        <Text as="p" size="sm" tone="danger">{{ failure }}</Text>
        <Link :as="NuxtLink" :to="back" underline>返回端点参考</Link>
      </template>
      <template v-else>
        <Spinner size="lg" />
        <Text as="p" size="sm" tone="muted">正在换取调试令牌…</Text>
      </template>
    </Stack>
  </Center>
</template>
