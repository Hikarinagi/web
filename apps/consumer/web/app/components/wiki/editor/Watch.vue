<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'
  import { Bell, BellRing } from '@lucide/vue'

  defineOptions({ name: 'WikiEditorWatch' })

  const props = defineProps<{ entry: number }>()
  const { data, refresh } = useHikariApiData('/api/v3/wiki/entries/{id}/watch', {
    key: `wiki-watch-${props.entry}`,
    path: { id: props.entry },
    lazy: true,
    server: false,
    toast: false,
  })
  const busy = ref(false)

  async function toggle() {
    busy.value = true
    try {
      await hikariRequest('/api/v3/wiki/entries/{id}/watch', {
        method: data.value?.watched ? 'DELETE' : 'PUT',
        path: { id: props.entry },
      })
      await refresh()
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <IconButton
    :label="data?.watched ? '取消关注' : '关注此条目'"
    :variant="data?.watched ? 'soft' : 'outline'"
    :tone="data?.watched ? 'accent' : 'neutral'"
    size="sm"
    :loading="busy"
    :disabled="!data"
    class="shrink-0"
    @click="toggle"
  >
    <BellRing v-if="data?.watched" />
    <Bell v-else />
  </IconButton>
</template>
