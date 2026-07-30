<script setup lang="ts">
  import { timeFormat } from '#imports'
  import Timeline from 'primevue/timeline'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import { CHANGE_REQUEST_EVENT_META } from '~/features/creator/labels'

  const props = defineProps<{
    events: BackendChangeRequestDetail['events']
    resourceType: string
  }>()

  const ordered = computed(() => [...props.events].reverse())
</script>

<template>
  <Timeline :value="ordered" class="text-sm" :pt="{ eventOpposite: { class: 'hidden' } }">
    <template #marker="{ item }">
      <span
        :class="[
          'mt-1.5 size-2.5 rounded-full',
          CHANGE_REQUEST_EVENT_META[item.type]?.dot ?? 'bg-surface-400',
        ]"
      />
    </template>
    <template #content="{ item }">
      <div class="flex flex-col gap-2 pb-5">
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="item.actor">
            <Avatar :user="item.actor" card shape="circle" class="size-5!" />
            <UserName :user="item.actor" class="font-medium" />
          </template>
          <span v-else class="font-medium text-muted-color">系统</span>
          <span :class="CHANGE_REQUEST_EVENT_META[item.type]?.text ?? 'text-muted-color'">
            {{ CHANGE_REQUEST_EVENT_META[item.type]?.label ?? item.type }}
          </span>
          <span class="text-xs text-muted-color">{{ timeFormat(item.created_at) }}</span>
        </div>
        <p v-if="item.body" class="whitespace-pre-wrap text-surface-600 dark:text-surface-300">
          {{ item.body }}
        </p>
        <CreatorChangesetView
          v-if="item.payload && item.payload.length"
          :payload="item.payload"
          :resource-type="resourceType"
        />
      </div>
    </template>
  </Timeline>
</template>
