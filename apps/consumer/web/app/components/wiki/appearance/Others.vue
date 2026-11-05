<script setup lang="ts">
  import { Button, Empty, IconButton, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { Plus, Undo2, X } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry, EntryStatement } from '~/features/wiki/editor/draft'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiAppearanceOthers' })

  const props = defineProps<{ appearance: number; base: string }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const relation = computed(() =>
    editor.definitions.value
      .get('APPEARANCE')
      ?.properties.find(item => item.property === 'APPEARANCE_RELATION'),
  )
  const live = (entry: EditableEntry, property: EntryStatement['property']) =>
    entry.statements.find(item => item.property === property && item.status !== 'DEPRECATED')
  const others = computed(() =>
    [...editor.entries.value.values()]
      .filter(entry => entry.type === 'APPEARANCE' && entry.id !== props.appearance)
      .map(entry => ({
        id: entry.id,
        name: live(entry, 'LABEL')?.text || entry.label,
        work: live(entry, 'WORK')?.target?.label ?? null,
        image: live(entry, 'IMAGE')?.media ?? null,
        detached: editor.draft.value.detached.includes(entry.id),
      })),
  )
  const relations = computed(() => editor.property(props.appearance, 'APPEARANCE_RELATION').values)
  const count = computed(
    () =>
      others.value.filter(item => !item.detached).length +
      relations.value.filter(item => item.state !== 'removed').length,
  )
</script>

<template>
  <Panel title="其他作品中的出场" :count="count">
    <template #actions>
      <WikiFieldRule
        v-if="relation?.clauses.length"
        label="其他作品中的出场"
        :clauses="relation.clauses"
      />
      <Button
        :as="NuxtLink"
        :to="{ path: `${base}/same`, query: route.query }"
        size="sm"
        variant="ghost"
      >
        <template #icon><Plus /></template>
        添加
      </Button>
    </template>
    <Empty v-if="!others.length && !relations.length" title="暂无其他作品中的出场" />
    <Stack v-else gap="none">
      <Inline
        v-for="other in others"
        :key="other.id"
        gap="md"
        align="center"
        :wrap="false"
        :class="cn('rounded-md px-3 py-2.5', other.detached && 'bg-danger-soft')"
      >
        <WikiWorkCastAvatar :image="other.image" :name="other.name" />
        <Stack gap="none" class="min-w-0 flex-1">
          <Link
            :as="NuxtLink"
            :to="`/entries/${other.id}/edit`"
            lang="ja"
            :class="cn('text-sm', other.detached && 'line-through')"
          >
            {{ other.name }}
          </Link>
          <Text v-if="other.work" size="xs" tone="muted" lang="ja" truncate>{{ other.work }}</Text>
        </Stack>
        <IconButton
          :label="other.detached ? '恢复' : '不是同一角色'"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="editor.detach(other.id, !other.detached)"
        >
          <Undo2 v-if="other.detached" />
          <X v-else />
        </IconButton>
      </Inline>
      <Inline
        v-for="item in relations"
        :key="item.id"
        gap="md"
        align="center"
        :wrap="false"
        :class="
          cn(
            'rounded-md px-3 py-2.5',
            item.state === 'added' && 'bg-success-soft',
            item.state === 'removed' && 'bg-danger-soft',
          )
        "
      >
        <WikiWorkCastAvatar :image="null" :name="item.value.target?.label ?? ''" />
        <Link
          v-if="item.value.target"
          :as="NuxtLink"
          :to="`/entries/${item.value.target.id}/edit`"
          lang="ja"
          :class="cn('min-w-0 flex-1 text-sm', item.state === 'removed' && 'line-through')"
        >
          {{ item.value.target.label || '未命名' }}
        </Link>
        <IconButton
          :label="item.state === 'removed' ? '恢复' : item.state === 'added' ? '取消添加' : '删除'"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="item.state === 'same' ? editor.remove(item.id) : editor.revert(item.id)"
        >
          <Undo2 v-if="item.state === 'removed'" />
          <X v-else />
        </IconButton>
      </Inline>
    </Stack>
  </Panel>
</template>
