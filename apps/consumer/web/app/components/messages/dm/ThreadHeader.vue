<script setup lang="ts">
  import { Badge, IconButton, Indicator, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import type { DmPeer } from '~/features/messages/dm'
  import { usePresence } from '~/features/messages/usePresence'

  defineOptions({ name: 'MessagesDmThreadHeader' })
  const props = defineProps<{ peer: DmPeer }>()
  const emit = defineEmits<{ back: [] }>()

  const { online } = usePresence(computed(() => props.peer.id))
</script>

<template>
  <Inline as="header" gap="sm" class="h-14 shrink-0 border-b border-line px-3">
    <IconButton label="返回" :tooltip="false" pill class="shrink-0 lg:hidden" @click="emit('back')">
      <ArrowLeft />
    </IconButton>
    <NuxtLink :to="`/space/${peer.id}`" class="flex min-w-0 items-center gap-2.5">
      <Badge
        :content="online ? 'online' : 'offline'"
        bare
        :label="online ? '在线' : '离线'"
        placement="bottom-end"
        shape="circle"
        class="shrink-0"
      >
        <template #content>
          <Indicator :tone="online ? 'success' : 'neutral'" size="lg" />
        </template>
        <Avatar :user="peer" class="size-9!" />
      </Badge>
      <Stack gap="none" class="min-w-0">
        <UserName :user="peer" :handle="false" class="block truncate text-sm font-bold text-fg" />
        <Text as="span" size="xs" tone="muted">{{ online ? '在线' : '离线' }}</Text>
      </Stack>
    </NuxtLink>
  </Inline>
</template>
