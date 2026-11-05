<script setup lang="ts">
  import { Button, Card, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight, RotateCcw } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { restoreInto } from '~/features/wiki/editor/restore'
  import { versionName } from '~/features/wiki/history'
  import type { VersionPageData } from '~~/server/api/pages/entries/[id]/history/[revision].get'

  defineOptions({ name: 'WikiHistoryVersion' })

  const props = defineProps<{ data: VersionPageData }>()
  const emit = defineEmits<{ changed: [] }>()
  const drafts = useWikiDraftsStore()
  const undoing = ref(false)

  const entry = computed(() => props.data.entry)
  const version = computed(() => props.data.version)
  const base = computed(() => `/entries/${entry.value.id}/history`)
  const part = computed(() =>
    props.data.edit.entries.find(item => item.entry.id === entry.value.id),
  )
  const undoable = computed(
    () =>
      !props.data.edit.batch.imported && !props.data.edit.reverted_at && !part.value?.reverted_at,
  )
  const names = computed(() => props.data.names[entry.value.type]?.properties ?? {})

  function restore() {
    const values = version.value.content.properties.flatMap(group =>
      group.statements.flatMap(item => (item.after ? [item.after] : [])),
    )
    drafts.update(
      `edit:${entry.value.id}`,
      { title: entry.value.label || '未命名', path: `/entries/${entry.value.id}/edit` },
      draft => restoreInto(draft, entry.value, values),
    )
    void navigateTo(`/entries/${entry.value.id}/edit`)
  }
</script>

<template>
  <Stack gap="lg">
    <Card>
      <Stack gap="sm">
        <Inline gap="md" align="start" justify="between">
          <Stack gap="xs" class="min-w-0">
            <Text weight="semibold">{{ versionName(version.created_at) }}</Text>
            <Inline gap="sm" align="center" :wrap="false">
              <Avatar :user="version.editor" size="sm" />
              <UserName :user="version.editor" class="text-sm" />
              <Tag v-if="part?.reverted_at || data.edit.reverted_at" size="sm" tone="neutral">
                已撤销
              </Tag>
            </Inline>
          </Stack>
          <Inline gap="sm">
            <Button
              v-if="undoable"
              variant="outline"
              tone="neutral"
              size="sm"
              @click="undoing = true"
            >
              撤销
            </Button>
            <Button v-if="version.number < version.latest" size="sm" @click="restore">
              <template #icon><RotateCcw /></template>
              恢复到此版本
            </Button>
          </Inline>
        </Inline>
        <Text v-if="version.note" size="sm">{{ version.note }}</Text>
        <WikiBasis v-if="version.basis" :basis="version.basis" />
        <Inline gap="sm">
          <Button
            :as="NuxtLink"
            :to="`${base}/${version.number - 1}`"
            :disabled="version.number <= 1"
            variant="ghost"
            tone="neutral"
            size="sm"
          >
            <template #icon><ChevronLeft /></template>
            上一个版本
          </Button>
          <Button
            :as="NuxtLink"
            :to="`${base}/${version.number + 1}`"
            :disabled="version.number >= version.latest"
            variant="ghost"
            tone="neutral"
            size="sm"
          >
            下一个版本
            <template #trailing><ChevronRight /></template>
          </Button>
        </Inline>
      </Stack>
    </Card>
    <WikiHistoryValues :content="version.content" :names="names" />
    <WikiChangesUndo
      v-model:open="undoing"
      :edit="data.edit"
      :names="data.names"
      :entry="entry.id"
      @done="((undoing = false), emit('changed'))"
    />
  </Stack>
</template>
