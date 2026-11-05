<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'
  import { Bell, BellRing } from '@lucide/vue'
  import { ENTRY_PAGE } from '~/features/wiki/editor/page'

  defineOptions({ name: 'WikiEditorWatch' })

  const props = defineProps<{ entry: number }>()
  const page = inject(ENTRY_PAGE)!
  const watched = ref(page.watched.value)
  watch(page.watched, next => {
    watched.value = next
  })
  const busy = ref(false)

  async function toggle() {
    busy.value = true
    try {
      await hikariRequest('/api/v3/wiki/entries/{id}/watch', {
        method: watched.value ? 'DELETE' : 'PUT',
        path: { id: props.entry },
      })
      watched.value = !watched.value
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <IconButton
    :label="watched ? '取消关注' : '关注此条目'"
    :variant="watched ? 'soft' : 'outline'"
    :tone="watched ? 'accent' : 'neutral'"
    size="sm"
    :loading="busy"
    class="shrink-0"
    @click="toggle"
  >
    <BellRing v-if="watched" />
    <Bell v-else />
  </IconButton>
</template>
