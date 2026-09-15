<script setup lang="ts">
  import { Badge, Card, Center, Flex, Ripple, Stack, Text } from '@hina-ui/vue'
  import { Bell } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { DmPageData } from '~~/server/api/pages/dm.get'
  import { cn } from '~/utils/cn'
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
  <Stack gap="none" class="min-h-screen">
    <LayoutAppHeader />
    <Stack as="main" gap="none" class="flex-1 pt-(--app-header-height)">
      <Flex
        class="mx-auto h-[calc(100dvh-var(--app-header-height))] w-full max-w-6xl gap-3 px-4 py-4 lg:gap-6 lg:px-6"
      >
        <Card
          as="aside"
          :padded="false"
          :class="
            cn('w-full shrink-0 flex-col rounded-xl lg:flex lg:w-80', drilled ? 'hidden' : 'flex')
          "
        >
          <MessagesDmList
            :items="items"
            :pending="false"
            :active-peer-id="selectedPeerId"
            class="min-h-0 flex-1"
            @open="open"
          >
            <Card
              :as="NuxtLink"
              to="/messages?view=notification"
              :padded="false"
              :class="
                cn(
                  'hn-state-layer flex w-full hn-interactive items-center gap-3 rounded-none border-0 px-4 py-3 text-left shadow-none hn-press-none',
                  selectedPeerId == null ? 'bg-accent-soft' : 'bg-transparent',
                )
              "
            >
              <Ripple />
              <Badge :content="unreadCount || null" shape="circle">
                <Center class="size-11 rounded-full bg-accent-soft text-accent-text">
                  <Bell class="size-5" aria-hidden="true" />
                </Center>
              </Badge>
              <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
                <Text as="span" size="sm" weight="semibold" truncate>通知</Text>
                <Text as="p" size="xs" tone="muted" truncate>互动、系统消息</Text>
              </Stack>
            </Card>
          </MessagesDmList>
        </Card>

        <Stack
          gap="none"
          :class="cn('min-h-0 min-w-0 flex-1 lg:block', drilled ? 'block' : 'hidden')"
        >
          <slot />
        </Stack>
      </Flex>
    </Stack>
  </Stack>
</template>
