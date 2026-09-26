<script setup lang="ts">
  import { Button, Center, Spinner, Stack } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type {
    SystemMessageDetail,
    SystemMessageItem,
  } from '~/features/notifications/notifications'
  import { notificationTarget } from '~/features/notifications/nav'

  defineOptions({ name: 'NotificationsDetailBody' })

  const props = defineProps<{
    item: SystemMessageItem | null
    detail: SystemMessageDetail | null
    loading: boolean
  }>()
  const emit = defineEmits<{ navigate: [] }>()

  const hasBody = computed(() => {
    const content = (props.detail?.content_json as { content?: unknown[] } | null)?.content
    return Array.isArray(content) && content.length > 0
  })
  const navWork = computed(() => notificationTarget(props.detail))
  const profileTo = computed(() => (props.item?.actor ? `/space/${props.item.actor.id}` : null))
</script>

<template>
  <Center v-if="loading" class="py-12">
    <Spinner size="lg" />
  </Center>

  <Stack v-else-if="detail" gap="lg" align="start">
    <HikariContent
      v-if="detail.content_json && hasBody"
      class="w-full wrap-anywhere"
      :doc="detail.content_json"
      :summaries="detail.entity_summaries"
      :emoji-sets="detail.emoji_sets"
    />
    <Button
      v-if="navWork"
      :as="NuxtLink"
      :to="navWork"
      :target="navWork.startsWith('/create') ? '_blank' : undefined"
      variant="soft"
      tone="neutral"
      size="sm"
      @click="emit('navigate')"
    >
      前往
      <template #trailing><ArrowRight aria-hidden="true" /></template>
    </Button>
    <Button
      v-else-if="profileTo"
      :as="NuxtLink"
      :to="profileTo"
      variant="soft"
      tone="neutral"
      size="sm"
      @click="emit('navigate')"
    >
      查看主页
    </Button>
  </Stack>
</template>
