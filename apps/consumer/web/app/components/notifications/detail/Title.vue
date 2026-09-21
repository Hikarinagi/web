<script setup lang="ts">
  import { Inline, Stack, Text, Time } from '@hina-ui/vue'
  import type { SystemMessageItem } from '~/features/notifications/notifications'

  defineOptions({ name: 'NotificationsDetailTitle' })

  defineProps<{ item: SystemMessageItem }>()
</script>

<template>
  <Inline as="span" gap="md" :wrap="false" class="min-w-0 flex-1 overflow-hidden">
    <NotificationsActorAvatars
      :actor="item.actor"
      :actors="item.actors"
      :template-key="item.template_key"
      :type="item.type"
    />
    <Stack as="span" gap="none" class="min-w-0">
      <Text as="span" size="sm" truncate>
        <UserName v-if="item.actor" :user="item.actor" :handle="false" class="font-medium" />
        {{ item.title }}
      </Text>
      <Time :value="item.sent_at" format="relative" class="text-xs text-muted" />
    </Stack>
  </Inline>
</template>
