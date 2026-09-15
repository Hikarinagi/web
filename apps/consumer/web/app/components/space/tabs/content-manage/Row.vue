<script setup lang="ts">
  import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    IconButton,
    Inline,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { Ellipsis, Eye, Pencil, ThumbsUp, Trash2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import {
    formatMonthDay,
    managedEditLabel,
    managedStatusBadge,
    managedTypeLabel,
    managedViewPath,
    type ManagedContentItem,
  } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsContentManageRow' })

  const props = defineProps<{ item: ManagedContentItem }>()
  const emit = defineEmits<{
    edit: [item: ManagedContentItem]
    remove: [item: ManagedContentItem]
  }>()

  const badge = computed(() => managedStatusBadge(props.item.status))
</script>

<template>
  <Inline align="center" gap="lg" :wrap="false" class="border-b border-line py-3.5 last:border-b-0">
    <HikariImage
      :src="item.cover?.src"
      :alt="item.title"
      class="h-14 w-20 shrink-0 rounded-md bg-subtle"
      image-class="size-full object-cover"
      :processing="{ width: 160, height: 112, fit: 'cover', quality: 80 }"
    />

    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline align="center" gap="sm" :wrap="false" class="min-w-0">
        <Tag v-if="badge" :tone="badge.tone" size="sm" class="shrink-0">{{ badge.label }}</Tag>
        <Text weight="medium" truncate>{{ item.title || '未命名草稿' }}</Text>
      </Inline>
      <Inline align="center" gap="md" :wrap="false">
        <Text size="xs" tone="muted">{{ managedTypeLabel(item) }}</Text>
        <Inline align="center" gap="xs" :wrap="false">
          <Eye class="size-3.5 text-muted" />
          <Text size="xs" tone="muted" class="tabular-nums">{{ item.view_count }}</Text>
        </Inline>
        <Inline align="center" gap="xs" :wrap="false">
          <ThumbsUp class="size-3.5 text-muted" />
          <Text size="xs" tone="muted" class="tabular-nums">{{ item.like_count }}</Text>
        </Inline>
        <Text size="xs" tone="muted">{{ formatMonthDay(item.updated_at) }}</Text>
      </Inline>
    </Stack>

    <Inline align="center" gap="xs" :wrap="false" class="hidden shrink-0 sm:flex">
      <Button variant="ghost" tone="neutral" size="sm" @click="emit('edit', item)">
        {{ managedEditLabel(item) }}
      </Button>
      <Button
        v-if="item.status === 'PUBLISHED'"
        :as="NuxtLink"
        :to="managedViewPath(item)"
        variant="ghost"
        tone="neutral"
        size="sm"
      >
        查看
      </Button>
      <Button variant="ghost" tone="danger" size="sm" @click="emit('remove', item)">删除</Button>
    </Inline>

    <DropdownMenu label="内容操作" align="end" class="w-40">
      <IconButton
        label="更多操作"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="shrink-0 sm:hidden"
      >
        <Ellipsis />
      </IconButton>
      <template #content>
        <DropdownMenuItem @select="emit('edit', item)">
          <template #icon><Pencil /></template>
          {{ managedEditLabel(item) }}
        </DropdownMenuItem>
        <DropdownMenuItem
          v-if="item.status === 'PUBLISHED'"
          @select="navigateTo(managedViewPath(item))"
        >
          <template #icon><Eye /></template>
          查看
        </DropdownMenuItem>
        <DropdownMenuItem tone="danger" @select="emit('remove', item)">
          <template #icon><Trash2 /></template>
          删除
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
  </Inline>
</template>
