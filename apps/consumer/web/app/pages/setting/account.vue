<script setup lang="ts">
  import { ME_KEY } from '~/features/space/me-context'

  defineOptions({ name: 'PageSpaceSettingAccount' })
  definePageMeta({ title: '账号安全' })

  const me = inject(ME_KEY)!
</script>

<template>
  <SpaceSettingSecurityForm :email="me.email" />
</template>
