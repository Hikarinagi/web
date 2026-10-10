<script setup lang="ts">
  import { ME_KEY } from '~/features/space/me-context'

  defineOptions({ name: 'PageSpaceSettingProfile' })
  definePageMeta({ title: '个人资料' })

  const me = inject(ME_KEY)!
</script>

<template>
  <SpaceSettingProfileForm :user="me" />
</template>
