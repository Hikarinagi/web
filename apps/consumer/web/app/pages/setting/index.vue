<script setup lang="ts">
  import { ME_KEY } from '~/features/space/me-context'

  defineOptions({ name: 'PageSpaceSettingProfile' })

  const me = inject(ME_KEY)!
</script>

<template>
  <SpaceSettingProfileForm :user="me" />
</template>
