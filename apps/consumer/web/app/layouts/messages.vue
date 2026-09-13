<script setup lang="ts">
  import { Bell } from '@lucide/vue'
  import type { DmPageData } from '~~/server/api/pages/dm.get'
  import { provideDmSurface } from '~/features/messages/useDmSurface'
  import { useUnread } from '~/features/notifications/useUnread'

  defineOptions({ name: 'MessagesLayout' })

  const route = useRoute()

  const peer = Number(route.query.peer)
  const dmUrl = (
    Number.isInteger(peer) && peer > 0 ? `/api/pages/dm?peer=${peer}` : '/api/pages/dm'
  ) as `/api/pages/${string}`
  const { data: dmData } = await useHikariApiData<DmPageData>(dmUrl, { watch: false })

  const { items, selectedPeerId, open, drilled } = provideDmSurface(dmData.value ?? null)
  const { unreadCount } = useUnread()

  const { emit, connected } = useRealtime()
  watch(connected, online => online && emit('dm:enter'), { immediate: true })
  onBeforeUnmount(() => emit('dm:leave'))
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <LayoutAppHeader />
    <main class="flex-1 pt-(--app-header-height)">
      <div
        class="mx-auto flex h-[calc(100dvh-var(--app-header-height))] w-full max-w-6xl gap-3 px-4 py-4 lg:gap-6 lg:px-6"
      >
        <aside
          class="w-full shrink-0 flex-col overflow-hidden rounded-xl border border-surface-200 bg-surface-0 lg:flex lg:w-80 dark:border-surface-800 dark:bg-surface-900"
          :class="drilled ? 'hidden' : 'flex'"
        >
          <MessagesDmList
            :items="items"
            :pending="false"
            :active-peer-id="selectedPeerId"
            class="min-h-0 flex-1"
            @open="open"
          >
            <Button
              unstyled
              as="router-link"
              to="/messages?view=notification"
              class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
              :class="
                selectedPeerId == null
                  ? 'bg-primary/10'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-800/60'
              "
            >
              <OverlayBadge
                severity="danger"
                :value="unreadCount > 99 ? '99+' : String(unreadCount)"
                class="shrink-0"
                :pt="{ pcBadge: { root: { class: unreadCount === 0 ? 'hidden!' : undefined } } }"
              >
                <div
                  class="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <Bell class="size-5" aria-hidden="true" />
                </div>
              </OverlayBadge>
              <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="truncate text-sm font-semibold text-color">通知</span>
                <p class="truncate text-[13px] text-muted-color">互动、系统消息</p>
              </div>
            </Button>
          </MessagesDmList>
        </aside>

        <div class="min-h-0 min-w-0 flex-1 lg:block" :class="drilled ? 'block' : 'hidden'">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
