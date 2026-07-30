<script setup lang="ts">
  import { SETTING_ME_KEY } from '~/features/space/setting-context'

  defineOptions({ name: 'PageSpaceSettingAccount' })
  definePageMeta({ title: '账号安全' })

  const me = inject(SETTING_ME_KEY)!
</script>

<template>
  <SpaceSettingSecurityForm :email="me.email" />
</template>
