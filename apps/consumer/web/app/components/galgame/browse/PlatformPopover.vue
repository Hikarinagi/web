<script setup lang="ts">
  import { MultiSelect } from '@hina-ui/vue'
  import { PLATFORM_GROUPS, platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameBrowsePlatformPopover' })
  const model = defineModel<string[]>({ default: () => [] })

  const platformGroups = PLATFORM_GROUPS.map(group => ({
    label: group.label,
    options: group.codes.map(code => ({ value: code, label: platformLabel(code) })),
  }))
</script>

<template>
  <MultiSelect v-model="model" :options="platformGroups" placeholder="平台" class="w-32" />
</template>
