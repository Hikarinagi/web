<script setup lang="ts">
  import { timeFormat, timeFromNow } from '#imports'
  import { Cog, ImageOff } from '@lucide/vue'
  import type { BackendContributionActivityItem } from '~/features/creator/contribution'
  import {
    CHANGE_REQUEST_EVENT_META,
    CHANGE_REQUEST_STATUS_META,
    RESOURCE_TYPE_ICON,
    RESOURCE_TYPE_LABEL,
  } from '~/features/creator/labels'

  const props = defineProps<{ item: BackendContributionActivityItem; isLast?: boolean }>()

  const meta = computed(() => CHANGE_REQUEST_EVENT_META[props.item.type])
  const statusMeta = computed(() => CHANGE_REQUEST_STATUS_META[props.item.change_request.status])
  const typeLabel = computed(
    () => RESOURCE_TYPE_LABEL[props.item.resource_type] ?? props.item.resource_type,
  )
  const typeIcon = computed(() => RESOURCE_TYPE_ICON[props.item.resource_type])
  const title = computed(
    () => props.item.resource?.title?.trim() || props.item.change_request.summary,
  )
</script>

<template>
  <NuxtLink :to="`/create/contributions/${item.change_request.id}`" class="group flex gap-3">
    <div class="flex flex-col items-center pt-1">
      <Avatar v-if="item.actor" :user="item.actor" card shape="circle" class="size-8! shrink-0" />
      <span
        v-else
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-100 text-muted-color dark:bg-surface-800"
      >
        <Cog :size="16" />
      </span>
      <span v-if="!isLast" class="mt-1.5 w-px flex-1 bg-surface-200 dark:bg-surface-700" />
    </div>

    <div class="min-w-0 flex-1" :class="{ 'pb-4': !isLast }">
      <div
        class="flex gap-3 rounded-lg p-2.5 transition-colors group-hover:bg-surface-100 dark:group-hover:bg-surface-800"
      >
        <HikariImage
          :src="item.resource?.cover"
          :alt="title"
          preset="small"
          class="h-16 w-12 shrink-0 rounded-md"
          image-class="object-cover"
        >
          <template #empty>
            <div
              class="flex h-16 w-12 items-center justify-center rounded-md bg-surface-100 text-muted-color dark:bg-surface-800"
            >
              <ImageOff :size="16" />
            </div>
          </template>
          <template #error>
            <div
              class="flex h-16 w-12 items-center justify-center rounded-md bg-surface-100 text-muted-color dark:bg-surface-800"
            >
              <ImageOff :size="16" />
            </div>
          </template>
        </HikariImage>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <UserName :user="item.actor" fallback="系统" class="text-sm font-medium" />
            <span class="text-sm" :class="meta?.text ?? 'text-muted-color'">
              {{ meta?.label ?? item.type }}
            </span>
            <span
              class="rounded bg-surface-100 px-1.5 font-mono text-xs text-muted-color dark:bg-surface-800"
            >
              #{{ item.change_request.id }}
            </span>
            <span
              v-if="statusMeta"
              class="rounded-full border px-1.5 py-px text-xs"
              :class="statusMeta.badge"
            >
              {{ statusMeta.label }}
            </span>
            <span class="text-xs text-muted-color" :title="timeFormat(item.created_at)">
              {{ timeFromNow(item.created_at) }}
            </span>
          </div>

          <div class="flex min-w-0 items-center gap-1.5 text-sm">
            <span
              class="inline-flex shrink-0 items-center gap-1 rounded bg-surface-100 px-1.5 py-0.5 text-xs text-muted-color dark:bg-surface-800"
            >
              <component :is="typeIcon" v-if="typeIcon" :size="12" />
              {{ typeLabel }}
            </span>
            <span class="truncate text-surface-700 dark:text-surface-200">{{ title }}</span>
          </div>

          <p v-if="item.body" class="truncate text-xs text-muted-color">{{ item.body }}</p>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
