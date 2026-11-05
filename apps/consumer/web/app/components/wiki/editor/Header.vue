<script setup lang="ts">
  import {
    AspectRatio,
    Button,
    DropdownMenu,
    DropdownMenuItem,
    Inline,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { Ellipsis, History } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { EditableEntry, ValueDraft } from '~/features/wiki/editor/draft'
  import { readerPath } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiEditorHeader' })

  const props = defineProps<{
    entry: EditableEntry
    type: string
    owner: ValueDraft['target']
    image: ValueDraft['media']
  }>()
  const { canAny } = useCreatorPermissions()
  const patrol = computed(() => canAny(WIKI_PERMISSIONS.PATROL))
  const base = computed(() => `/entries/${props.entry.id}/edit`)
  const reader = computed(() => readerPath(props.entry.resource))
  const portrait = computed(() => props.entry.type === 'GAME' || props.entry.type === 'SERIES')
  const PAGES: Partial<Record<EditableEntry['type'], string>> = {
    GAME: '查看游戏页',
    PERSON: '查看人物页',
    ORGANIZATION: '查看组织页',
    APPEARANCE: '查看角色页',
  }
</script>

<template>
  <Stack gap="md">
    <Inline gap="md" align="start" :wrap="false">
      <AspectRatio
        :ratio="portrait ? 3 / 4 : 1"
        class="w-16 shrink-0 overflow-hidden rounded-md bg-inset"
      >
        <HikariImage
          v-if="image"
          :src="image"
          alt=""
          preset="small"
          class="size-full"
          image-class="size-full object-cover"
        />
      </AspectRatio>
      <Stack gap="xs" class="min-w-0">
        <Text size="xs" tone="muted">{{ type }}</Text>
        <Link
          v-if="owner"
          :as="NuxtLink"
          :to="`/entries/${owner.id}/edit`"
          tone="neutral"
          class="truncate text-sm"
          lang="ja"
        >
          {{ owner.label }}
        </Link>
        <Text size="lg" weight="semibold" lang="ja" class="break-words">
          {{ entry.label || '未命名' }}
        </Text>
      </Stack>
    </Inline>
    <Inline gap="sm">
      <WikiEditorWatch :entry="entry.id" />
      <Button
        :as="NuxtLink"
        :to="`/entries/${entry.id}/history`"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #icon><History /></template>
        全部修改记录
      </Button>
      <DropdownMenu label="更多" align="end">
        <IconButton label="更多" variant="outline" tone="neutral" size="sm"
          ><Ellipsis
        /></IconButton>
        <template #content>
          <DropdownMenuItem v-if="reader" @select="navigateTo(reader)">
            {{ PAGES[entry.type] ?? '查看作品页' }}
          </DropdownMenuItem>
          <DropdownMenuItem @select="navigateTo(`/entries/${entry.id}/merge`)"
            >合并</DropdownMenuItem
          >
          <template v-if="patrol">
            <DropdownMenuItem @select="navigateTo(`${base}/protect`)">
              {{ entry.protection ? '解除锁定' : '锁定' }}
            </DropdownMenuItem>
            <DropdownMenuItem
              :tone="entry.deleted ? undefined : 'danger'"
              @select="navigateTo(`${base}/delete`)"
            >
              {{ entry.deleted ? '恢复条目' : '删除' }}
            </DropdownMenuItem>
          </template>
        </template>
      </DropdownMenu>
    </Inline>
  </Stack>
</template>
