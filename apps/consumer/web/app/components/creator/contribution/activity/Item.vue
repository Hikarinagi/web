<script setup lang="ts">
  import { Center, Flex, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { timeFormat, timeFromNow } from '#imports'
  import { cn } from '~/utils/cn'
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
    <Stack gap="none" align="center" class="pt-1">
      <Avatar v-if="item.actor" :user="item.actor" card class="size-8! shrink-0" />
      <Center v-else as="span" class="size-8 shrink-0 rounded-full bg-subtle text-muted">
        <Cog class="size-4" />
      </Center>
      <Flex v-if="!isLast" as="span" class="mt-1.5 w-px flex-1 bg-line" />
    </Stack>

    <Stack gap="none" :class="cn('min-w-0 flex-1', !isLast && 'pb-4')">
      <Inline
        gap="sm"
        align="start"
        :wrap="false"
        class="rounded-lg p-2.5 transition-colors group-hover:bg-subtle"
      >
        <HikariImage
          :src="item.resource?.cover"
          :alt="title"
          preset="small"
          class="h-16 w-12 shrink-0 rounded-md"
          image-class="object-cover"
        >
          <template #empty>
            <Center class="h-16 w-12 rounded-md bg-subtle text-muted">
              <ImageOff class="size-4" />
            </Center>
          </template>
          <template #error>
            <Center class="h-16 w-12 rounded-md bg-subtle text-muted">
              <ImageOff class="size-4" />
            </Center>
          </template>
        </HikariImage>

        <Stack gap="xs" class="min-w-0 flex-1">
          <Inline gap="xs" align="center">
            <UserName :user="item.actor" fallback="系统" class="text-sm font-medium" />
            <Text as="span" size="sm" :tone="meta?.tone ?? 'muted'">
              {{ meta?.label ?? item.type }}
            </Text>
            <Tag size="sm" tone="neutral" class="font-mono">#{{ item.change_request.id }}</Tag>
            <Tag v-if="statusMeta" size="sm" variant="outline" :tone="statusMeta.tone">
              {{ statusMeta.label }}
            </Tag>
            <Text v-tooltip="timeFormat(item.created_at)" as="span" size="xs" tone="muted">
              {{ timeFromNow(item.created_at) }}
            </Text>
          </Inline>

          <Inline gap="xs" align="center" :wrap="false" class="min-w-0 text-sm">
            <Tag size="sm" tone="neutral" class="shrink-0">
              <component :is="typeIcon" v-if="typeIcon" />
              {{ typeLabel }}
            </Tag>
            <Text as="span" size="sm" truncate>{{ title }}</Text>
          </Inline>

          <Text v-if="item.body" size="xs" tone="muted" truncate>{{ item.body }}</Text>
        </Stack>
      </Inline>
    </Stack>
  </NuxtLink>
</template>
