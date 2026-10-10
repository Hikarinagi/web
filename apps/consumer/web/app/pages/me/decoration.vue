<script setup lang="ts">
  import { ME_KEY } from '~/features/space/me-context'

  defineOptions({ name: 'PageMeDecoration' })
  definePageMeta({ title: '我的装扮' })

  const me = inject(ME_KEY)!
  const { data, refresh } = await useHikariApiData('/api/pages/me/decoration', { fatal: true })
</script>

<template>
  <MeDecorationPanel :me="me" :data="data ?? null" :refresh="refresh" />
</template>
