<script setup lang="ts">
  import type { SystemMessageItem } from '~/features/notifications/notifications'

  defineProps<{ items: SystemMessageItem[]; loading?: boolean }>()
  const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="flex w-80 flex-col">
    <div class="flex items-center justify-between pb-1">
      <h2 class="text-sm font-semibold text-color">消息</h2>
      <ViewAllLink to="/messages" class="text-xs" @click="emit('close')">查看全部</ViewAllLink>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <Spinner :size="28" />
    </div>
    <ScrollArea v-else-if="items.length" class="-mx-2 max-h-96">
      <div class="flex flex-col" @click="emit('close')">
        <NotificationsItem v-for="m in items" :key="m.id" :item="m" compact />
      </div>
    </ScrollArea>
    <p v-else class="py-8 text-center text-sm text-muted-color">还没有消息</p>
  </div>
</template>
