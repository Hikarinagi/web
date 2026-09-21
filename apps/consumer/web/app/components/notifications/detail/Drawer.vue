<script setup lang="ts">
  import { Drawer, Sheet } from '@hina-ui/vue'
  import type { SystemMessageDetail } from '~/features/notifications/notifications'
  import { useNotificationDrawer } from '~/features/notifications/useDrawer'

  defineOptions({ name: 'NotificationsDetailDrawer' })

  const { visible, item, close } = useNotificationDrawer()
  const narrow = useNarrow()

  const detail = ref<SystemMessageDetail | null>(null)
  const loading = ref(false)

  watch(
    () => item.value?.id,
    async id => {
      if (id == null) return
      detail.value = null
      loading.value = true
      detail.value = await hikariRequest('/api/v3/system-messages/{id}', {
        path: { id },
        toast: false,
      }).catch(() => null)
      loading.value = false
    },
  )

  const route = useRoute()
  watch(
    () => route.fullPath,
    () => close(),
  )
</script>

<template>
  <Sheet v-if="narrow" v-model:open="visible" title="通知详情" class="h-[82dvh]">
    <template v-if="item" #title><NotificationsDetailTitle :item="item" /></template>
    <template #content>
      <NotificationsDetailBody :item="item" :detail="detail" :loading="loading" @navigate="close" />
    </template>
  </Sheet>

  <Drawer v-else v-model:open="visible" side="end" size="lg" title="通知详情">
    <template v-if="item" #title><NotificationsDetailTitle :item="item" /></template>
    <template #content>
      <NotificationsDetailBody :item="item" :detail="detail" :loading="loading" @navigate="close" />
    </template>
  </Drawer>
</template>
