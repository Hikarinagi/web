<script setup lang="ts">
  import { SETTING_ME_KEY } from '~/features/space/setting-context'

  defineOptions({ name: 'PageSpaceSettingProfile' })
  definePageMeta({ title: '个人资料' })

  const me = inject(SETTING_ME_KEY)!
</script>

<template>
  <SpaceSettingProfileForm :user="me" />
</template>
