<script setup lang="ts">
  import { Card, Indicator, Ripple, Stack, Text, Time } from '@hina-ui/vue'
  import type { SystemMessageItem } from '~/features/notifications/notifications'
  import { useNotificationDrawer } from '~/features/notifications/useDrawer'
  import { cn } from '~/utils/cn'

  const props = defineProps<{ item: SystemMessageItem; compact?: boolean }>()

  const { open } = useNotificationDrawer()
  const read = ref(props.item.is_read)
  watch(
    () => props.item.is_read,
    value => (read.value = value),
  )

  async function markRead() {
    if (read.value) return
    read.value = true
    const ok = await hikariRequest('/api/v3/system-messages/{id}/read', {
      method: 'PUT',
      path: { id: props.item.id },
      toast: false,
    })
      .then(() => true)
      .catch(() => false)
    if (!ok) read.value = props.item.is_read
  }

  async function activate() {
    if (props.item.template_key === 'achievement.unlock') {
      void markRead()
      await navigateTo('/setting/decoration')
      return
    }
    if (props.item.template_key === 'interaction.dm' && props.item.actor) {
      await navigateTo(`/messages?peer=${props.item.actor.id}`)
      return
    }
    open(props.item)
    await markRead()
  }
</script>

<template>
  <Card
    as="button"
    :padded="false"
    :class="
      cn(
        'hn-state-layer flex w-full hn-interactive items-start gap-3 rounded-xl border-0 bg-transparent px-3 text-left shadow-none hn-press-none',
        compact ? 'py-2.5' : 'py-3.5',
      )
    "
    @click="activate"
  >
    <Ripple />
    <NotificationsActorAvatars
      :actor="item.actor"
      :actors="item.actors"
      :template-key="item.template_key"
      :type="item.type"
    />

    <Stack gap="xs" class="min-w-0 flex-1">
      <Text as="p" size="sm" class="line-clamp-2 leading-relaxed">
        <UserName v-if="item.actor" :user="item.actor" :handle="false" class="font-medium" />
        {{ item.title }}
      </Text>
      <Time :value="item.sent_at" format="relative" class="text-xs text-muted" />
    </Stack>

    <Indicator v-if="!read" tone="accent" class="mt-1.5" />
  </Card>
</template>
