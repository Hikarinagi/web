<script setup lang="ts">
  import { SETTING_ME_KEY } from '~/features/space/setting-context'

  defineOptions({ name: 'PageSpaceSettingPreference' })
  definePageMeta({ title: '内容偏好' })

  const me = inject(SETTING_ME_KEY)!
</script>

<template>
  <SpaceSettingPreferencePanel :content-limit="me.content_limit" :hide-otome="me.hide_otome" />
</template>
