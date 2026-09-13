<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'
  import { breakpointsTailwind } from '@vueuse/core'
  import type { SystemMessageDetail } from '~/features/notifications/notifications'
  import { useNotificationDrawer } from '~/features/notifications/useDrawer'
  import { notificationTarget } from '~/features/notifications/nav'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'NotificationsDetailDrawer' })

  const { visible, item, close } = useNotificationDrawer()

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

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')
  const position = computed(() => (isMobile.value ? 'bottom' : 'right'))
  const rootClass = computed(() =>
    isMobile.value ? 'app-mobile-sheet h-[82dvh]!' : 'w-[min(94vw,32rem)]!',
  )

  const hasBody = computed(() => {
    const content = (detail.value?.content_json as { content?: unknown[] } | null)?.content
    return Array.isArray(content) && content.length > 0
  })
  const navWork = computed(() => notificationTarget(detail.value))
  const profileTo = computed(() => (item.value?.actor ? `/space/${item.value.actor.id}` : null))
</script>

<template>
  <Drawer
    v-model:visible="visible"
    :position="position"
    :pt="{
      root: { class: rootClass },
      header: { class: 'gap-3' },
      pcCloseButton: { root: { class: 'shrink-0' } },
    }"
  >
    <template #header>
      <div class="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        <NotificationsActorAvatars
          v-if="item"
          :actor="item.actor"
          :actors="item.actors"
          :template-key="item.template_key"
          :type="item.type"
        />
        <div class="min-w-0">
          <p class="truncate text-sm text-color">
            <UserName v-if="item?.actor" :user="item.actor" :handle="false" class="font-medium" />
            {{ item?.title }}
          </p>
          <p v-if="item" class="text-xs text-muted-color">{{ timeFromNow(item.sent_at) }}</p>
        </div>
      </div>
    </template>

    <div v-if="loading" class="flex justify-center py-12">
      <Spinner :size="28" />
    </div>
    <template v-else-if="detail">
      <HikariContent
        v-if="detail.content_json && hasBody"
        :doc="detail.content_json"
        :summaries="detail.entity_summaries"
        :emoji-sets="detail.emoji_sets"
        class="mb-5"
      />
      <Button
        v-if="navWork"
        as="router-link"
        :to="navWork"
        :target="navWork.startsWith('/create') ? '_blank' : undefined"
        size="small"
        severity="secondary"
        class="gap-1"
        @click="close"
      >
        前往
        <ArrowRight class="size-4" aria-hidden="true" />
      </Button>
      <Button
        v-else-if="profileTo"
        as="router-link"
        :to="profileTo"
        label="查看主页"
        size="small"
        severity="secondary"
        @click="close"
      />
    </template>
  </Drawer>
</template>
