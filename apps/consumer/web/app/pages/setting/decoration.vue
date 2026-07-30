<script setup lang="ts">
  import { SETTING_ME_KEY } from '~/features/space/setting-context'

  defineOptions({ name: 'PageSpaceSettingDecoration' })
  definePageMeta({ title: '我的装扮' })

  const me = inject(SETTING_ME_KEY)!
  const { data, refresh } = await useHikariApiData('/api/pages/setting/decoration', {
    fatal: true,
  })
</script>

<template>
  <SpaceSettingDecorationPanel :me="me" :data="data ?? null" :refresh="refresh" />
</template>
