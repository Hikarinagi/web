<script setup lang="ts">
  import { ME_KEY } from '~/features/space/me-context'

  defineOptions({ name: 'PageSpaceSettingPreference' })
  definePageMeta({ title: '内容偏好' })

  const me = inject(ME_KEY)!
</script>

<template>
  <SpaceSettingPreferencePanel :limits="me" :hide-otome="me.hide_otome" />
</template>
