<script setup lang="ts">
  import { ArrowLeft } from '@lucide/vue'
  import type { DmPeer } from '~/features/messages/dm'
  import { usePresence } from '~/features/messages/usePresence'

  defineOptions({ name: 'MessagesDmThreadHeader' })
  const props = defineProps<{ peer: DmPeer }>()
  const emit = defineEmits<{ back: [] }>()

  const { online } = usePresence(computed(() => props.peer.id))
</script>

<template>
  <header
    class="flex h-14 shrink-0 items-center gap-2 border-b border-surface-200 px-3 dark:border-surface-800"
  >
    <Button
      rounded
      text
      severity="secondary"
      aria-label="返回"
      class="size-9! shrink-0 p-0! lg:hidden!"
      @click="emit('back')"
    >
      <template #icon><ArrowLeft class="size-5" /></template>
    </Button>
    <NuxtLink :to="`/space/${peer.id}`" class="flex min-w-0 items-center gap-2.5">
      <div class="relative shrink-0">
        <Avatar :user="peer" shape="circle" class="size-9!" />
        <span
          class="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface-0 dark:border-surface-900"
          :class="online ? 'bg-green-500' : 'bg-surface-300 dark:bg-surface-600'"
        />
      </div>
      <div class="min-w-0">
        <UserName
          :user="peer"
          :handle="false"
          class="block truncate text-sm font-bold text-color"
        />
        <span class="text-xs text-muted-color">{{ online ? '在线' : '离线' }}</span>
      </div>
    </NuxtLink>
  </header>
</template>
