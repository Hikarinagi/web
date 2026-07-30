<script setup lang="ts">
  import { Bell } from '@lucide/vue'
  import type Popover from 'primevue/popover'
  import type { SystemMessageItem } from '~/features/notifications/notifications'
  import { useUnread } from '~/features/notifications/useUnread'

  const { unreadCount } = useUnread()
  const mounted = useMounted()
  const op = ref<InstanceType<typeof Popover> | null>(null)
  const recent = ref<SystemMessageItem[]>([])
  const loadingRecent = ref(false)
  const showCount = computed(() => mounted.value && unreadCount.value > 0)
  const badgeValue = computed(() =>
    showCount.value ? (unreadCount.value > 99 ? '99+' : String(unreadCount.value)) : '0',
  )
  const bellLabel = computed(() =>
    showCount.value ? `消息通知，${unreadCount.value} 条未读` : '消息通知',
  )

  function toggle(event: MouseEvent) {
    op.value?.toggle(event)
  }

  async function onShow() {
    loadingRecent.value = true
    const page = await hikariRequest('/api/v3/system-messages', {
      query: { page: 1, page_size: 6 },
      toast: false,
    }).catch(() => null)
    if (page) recent.value = page.items
    loadingRecent.value = false
  }
</script>

<template>
  <div class="relative inline-flex shrink-0 items-center">
    <Button
      :aria-label="bellLabel"
      aria-haspopup="dialog"
      class="size-(--p-button-icon-only-width)! shrink-0"
      rounded
      severity="secondary"
      variant="text"
      @click="toggle"
    />
    <div class="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      <Button
        tabindex="-1"
        class="size-(--p-button-icon-only-width)! shrink-0 overflow-visible! p-0!"
        rounded
        severity="secondary"
        variant="text"
      >
        <template #icon>
          <OverlayBadge
            severity="danger"
            :value="badgeValue"
            :pt="{ pcBadge: { root: { class: showCount ? undefined : 'hidden!' } } }"
          >
            <Bell class="size-full text-color" />
          </OverlayBadge>
        </template>
      </Button>
    </div>

    <Popover
      ref="op"
      append-to="self"
      :pt="{ root: { class: 'popover-no-arrow top-full! start-auto! end-0! z-50! mt-2!' } }"
      @show="onShow"
    >
      <NotificationsPanel :items="recent" :loading="loadingRecent" @close="op?.hide()" />
    </Popover>
  </div>
</template>
