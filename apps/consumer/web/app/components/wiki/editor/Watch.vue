<script setup lang="ts">
  import { Button } from '@hina-ui/vue'
  import { Eye, EyeOff } from '@lucide/vue'

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
  <Button
    variant="outline"
    tone="neutral"
    size="sm"
    :loading="busy"
    :disabled="!data"
    @click="toggle"
  >
    <template #icon>
      <EyeOff v-if="data?.watched" />
      <Eye v-else />
    </template>
    {{ data?.watched ? '取消关注' : '关注' }}
  </Button>
</template>
