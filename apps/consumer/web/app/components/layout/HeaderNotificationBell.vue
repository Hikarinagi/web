<script setup lang="ts">
  import { Badge, IconButton, Popover } from '@hina-ui/vue'
  import { Bell } from '@lucide/vue'
  import type { SystemMessageItem } from '~/features/notifications/notifications'
  import { useUnread } from '~/features/notifications/useUnread'

  const { unreadCount } = useUnread()
  const mounted = useMounted()
  const open = ref(false)
  const recent = ref<SystemMessageItem[]>([])
  const loadingRecent = ref(false)
  const showCount = computed(() => mounted.value && unreadCount.value > 0)
  const bellLabel = computed(() =>
    showCount.value ? `消息通知，${unreadCount.value} 条未读` : '消息通知',
  )

  async function load() {
    loadingRecent.value = true
    const page = await hikariRequest('/api/v3/system-messages', {
      query: { page: 1, page_size: 6 },
      toast: false,
    }).catch(() => null)
    if (page) recent.value = page.items
    loadingRecent.value = false
  }

  watch(open, value => {
    if (value) void load()
  })
</script>

<template>
  <Badge :content="showCount ? unreadCount : null" shape="circle">
    <Popover v-model:open="open" align="end">
      <IconButton :label="bellLabel" pill aria-haspopup="dialog">
        <Bell />
      </IconButton>

      <template #content>
        <NotificationsPanel :items="recent" :loading="loadingRecent" @close="open = false" />
      </template>
    </Popover>
  </Badge>
</template>
