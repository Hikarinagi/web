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
  import { Ellipsis, Eye, Heart, Pencil, Trash2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import {
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

  const { t } = useLocaleText()

  const badge = computed(() => managedStatusBadge(props.item.status))
</script>

<template>
  <Inline align="center" gap="lg" :wrap="false" class="border-b border-line py-3.5 last:border-b-0">
    <HikariImage
      :src="item.cover"
      :alt="item.title"
      class="h-14 w-20 shrink-0 rounded-md bg-subtle"
      image-class="size-full object-cover"
      :processing="{ width: 160, height: 112, fit: 'cover', quality: 80 }"
    />

    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline align="center" gap="sm" :wrap="false" class="min-w-0">
        <Tag v-if="badge" :tone="badge.tone" size="sm" class="shrink-0">{{ badge.label }}</Tag>
        <Tag v-if="item.visible === 'PRIVATE'" tone="neutral" size="sm" class="shrink-0">
          {{ t('space.manage.private') }}
        </Tag>
        <Text weight="medium" truncate>{{ item.title || t('space.manage.untitled') }}</Text>
      </Inline>
      <Inline align="center" gap="md" :wrap="false">
        <Text size="xs" tone="muted">{{ managedTypeLabel(item) }}</Text>
        <Inline align="center" gap="xs" :wrap="false">
          <Eye class="size-3.5 text-muted" />
          <Text size="xs" tone="muted" class="tabular-nums">{{ item.view_count }}</Text>
        </Inline>
        <Inline align="center" gap="xs" :wrap="false">
          <Heart class="size-3.5 text-muted" />
          <Text size="xs" tone="muted" class="tabular-nums">{{ item.like_count }}</Text>
        </Inline>
        <Text size="xs" tone="muted">{{ formatDatePart(item.updated_at, 'monthDay') }}</Text>
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
        {{ t('common.view') }}
      </Button>
      <Button variant="ghost" tone="danger" size="sm" @click="emit('remove', item)">
        {{ t('common.delete') }}
      </Button>
    </Inline>

    <DropdownMenu :label="t('space.manage.actions')" align="end" class="w-40">
      <IconButton
        :label="t('space.manage.more')"
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
          {{ t('common.view') }}
        </DropdownMenuItem>
        <DropdownMenuItem tone="danger" @select="emit('remove', item)">
          <template #icon><Trash2 /></template>
          {{ t('common.delete') }}
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
  </Inline>
</template>
