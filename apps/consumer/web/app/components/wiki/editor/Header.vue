<script setup lang="ts">
  import {
    AspectRatio,
    Button,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    Heading,
    IconButton,
    Inline,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { Ellipsis, History, Lightbulb } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { EditableEntry, ValueDraft } from '~/features/wiki/editor/draft'
  import { readerPath } from '~/features/wiki/entries'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorHeader' })

  const props = defineProps<{
    entry: EditableEntry
    type: string
    owner: ValueDraft['target']
    image: ValueDraft['media']
    stacked: boolean
    base: string
  }>()
  const route = useRoute()
  const { canAny } = useCreatorPermissions()
  const patrol = computed(() => canAny(WIKI_PERMISSIONS.PATROL))
  const reader = computed(() => readerPath(props.entry.resource))
  const portrait = computed(() => props.entry.type === 'GAME' || props.entry.type === 'SERIES')
  const hints = useEntryHints(props.entry.id)
  const count = computed(() => hints.data.value?.items.length ?? 0)
  const PAGES: Partial<Record<EditableEntry['type'], string>> = {
    GAME: '查看游戏页',
    SERIES: '查看作品页',
    PERSON: '查看人物页',
    ORGANIZATION: '查看组织页',
    APPEARANCE: '查看角色页',
  }
</script>

<template>
  <Inline
    gap="lg"
    align="center"
    justify="between"
    :wrap="false"
    :class="
      cn(stacked ? 'flex-col items-stretch gap-3' : 'min-w-0 max-md:flex-col max-md:items-stretch')
    "
  >
    <Inline gap="md" align="center" :wrap="false" class="min-w-0 max-md:w-full">
      <AspectRatio
        :ratio="portrait ? 3 / 4 : 1"
        class="w-14 shrink-0 overflow-hidden rounded-md bg-inset"
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
      <Stack gap="xs" class="min-w-0 flex-1">
        <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
          <Text size="sm" tone="muted" class="shrink-0">编辑{{ type }}</Text>
          <Link
            v-if="owner"
            :as="NuxtLink"
            :to="`/entries/${owner.id}/edit/cast`"
            tone="neutral"
            class="min-w-0 truncate text-sm"
            lang="ja"
          >
            {{ owner.label }}
          </Link>
        </Inline>
        <Heading
          :level="2"
          :size="stacked ? 'sm' : 'md'"
          lang="ja"
          class="line-clamp-2 break-words"
        >
          {{ entry.label || '未命名' }}
        </Heading>
      </Stack>
    </Inline>
    <Inline gap="sm" align="center" :wrap="false">
      <Button
        v-if="count && !stacked"
        :as="NuxtLink"
        :to="{ query: { ...route.query, side: 'hints' } }"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #icon><Lightbulb /></template>
        建议 {{ count }}
      </Button>
      <WikiEditorWatch :entry="entry.id" />
      <Button
        :as="NuxtLink"
        :to="`/entries/${entry.id}/history`"
        variant="outline"
        tone="neutral"
        size="sm"
        :class="cn(stacked && 'flex-1')"
      >
        <template #icon><History /></template>
        全部修改记录
      </Button>
      <DropdownMenu align="end">
        <IconButton label="更多操作" variant="outline" tone="neutral" size="sm">
          <Ellipsis />
        </IconButton>
        <template #content>
          <DropdownMenuItem v-if="reader" @select="navigateTo(reader)">
            {{ PAGES[entry.type] ?? '查看作品页' }}
          </DropdownMenuItem>
          <DropdownMenuItem @select="navigateTo(`/entries/${entry.id}/merge`)">
            与重复的条目合并
          </DropdownMenuItem>
          <template v-if="patrol">
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="navigateTo({ path: `${base}/protect`, query: route.query })">
              {{ entry.protection ? '解除锁定' : '锁定' }}
            </DropdownMenuItem>
            <DropdownMenuItem
              :tone="entry.deleted ? undefined : 'danger'"
              @select="navigateTo({ path: `${base}/delete`, query: route.query })"
            >
              {{ entry.deleted ? '恢复此条目' : '删除此条目' }}
            </DropdownMenuItem>
          </template>
        </template>
      </DropdownMenu>
    </Inline>
  </Inline>
</template>
