<script setup lang="ts">
  import type { SystemMessageItem } from '~/features/notifications/notifications'
  import { useNotificationDrawer } from '~/features/notifications/useDrawer'
  import { timeFromNow } from '~/utils/time-format'

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
  <Button
    unstyled
    class="flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 text-left transition-colors hover:bg-emphasis"
    :class="compact ? 'py-2.5' : 'py-3.5'"
    @click="activate"
  >
    <NotificationsActorAvatars
      :actor="item.actor"
      :actors="item.actors"
      :template-key="item.template_key"
      :type="item.type"
    />

    <div class="min-w-0 flex-1">
      <p class="line-clamp-2 text-sm leading-relaxed text-color">
        <UserName v-if="item.actor" :user="item.actor" :handle="false" class="font-medium" />
        {{ item.title }}
      </p>
      <p class="mt-1 text-xs text-muted-color">{{ timeFromNow(item.sent_at) }}</p>
    </div>

    <span v-if="!read" class="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
  </Button>
</template>
