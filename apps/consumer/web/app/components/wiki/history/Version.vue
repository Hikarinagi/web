<script setup lang="ts">
  import {
    AlertDialog,
    Button,
    Card,
    Inline,
    Page,
    PageBody,
    Panel,
    Space,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { ArrowLeft, ChevronLeft, ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { restoreInto } from '~/features/wiki/editor/restore'
  import { versionName } from '~/features/wiki/history'
  import type { VersionPageData } from '~~/server/api/pages/entries/[id]/history/[revision].get'

  defineOptions({ name: 'WikiHistoryVersion' })

  const props = defineProps<{ data: VersionPageData }>()
  const emit = defineEmits<{ changed: [] }>()
  const route = useRoute()
  const router = useRouter()
  const drafts = useWikiDraftsStore()
  const { typeName } = useWikiDefinitions()
  const active = usePageActive()

  const entry = computed(() => props.data.entry)
  const version = computed(() => props.data.version)
  const base = computed(() => `/entries/${entry.value.id}/history`)
  const here = computed(() => `${base.value}/${version.value.number}`)
  const editPath = computed(() => `/entries/${entry.value.id}/edit`)
  const part = computed(() =>
    props.data.edit.entries.find(item => item.entry.id === entry.value.id),
  )
  const reverted = computed(() => !!(part.value?.reverted_at || props.data.edit.reverted_at))
  const undoable = computed(() => !props.data.edit.batch.imported && !reverted.value)
  const names = computed(() => props.data.names[entry.value.type]?.properties ?? {})
  const pending = computed(() => drafts.count(`edit:${entry.value.id}`))

  const panel = (name: string) =>
    computed({
      get: () => active.value && route.params.panel === name,
      set: next => {
        if (!next) void router.replace(here.value)
      },
    })
  const undoOpen = panel('undo')
  const restoreOpen = panel('restore')

  function restore() {
    const values = version.value.content.properties.flatMap(group =>
      group.statements.flatMap(item => (item.after ? [item.after] : [])),
    )
    drafts.update(
      `edit:${entry.value.id}`,
      { title: entry.value.label || '未命名', path: editPath.value },
      draft => restoreInto(draft, entry.value, values),
    )
    void navigateTo({ path: editPath.value, query: { save: '1' } })
  }
</script>

<template>
  <Page size="lg" class="max-md:py-4">
    <WikiPageHead
      :eyebrow="`${typeName(entry.type)}：${entry.label || '未命名'}`"
      :title="versionName(version.created_at)"
    >
      <template #actions>
        <Button :as="NuxtLink" :to="base" variant="outline" tone="neutral" size="sm">
          <template #icon><ArrowLeft /></template>
          修改记录
        </Button>
        <Button
          v-if="undoable"
          :as="NuxtLink"
          :to="`${here}/undo`"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          撤销本次修改
        </Button>
        <Button
          v-if="version.number < version.latest"
          :as="NuxtLink"
          :to="`${here}/restore`"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          恢复到此版本
        </Button>
      </template>
    </WikiPageHead>
    <PageBody>
      <Panel :title="part?.summary || data.edit.summary || '未改动内容'">
        <Stack gap="md">
          <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
            <Avatar :user="version.editor" size="sm" />
            <UserName :user="version.editor" class="text-sm" />
            <Text as="span" size="sm" tone="muted" class="shrink-0">
              {{ revisionTime(version.created_at) }}
            </Text>
            <Text v-if="reverted" as="span" size="sm" tone="muted" class="shrink-0">已撤销</Text>
          </Inline>
          <Text v-if="version.note" size="sm">{{ version.note }}</Text>
          <WikiBasis v-if="version.basis" :basis="version.basis" />
          <Card v-if="part?.comparison" :padded="false" class="overflow-hidden">
            <WikiDiffTable :comparison="part.comparison" :names="names" />
          </Card>
        </Stack>
      </Panel>
      <WikiHistoryValues :content="version.content" :names="names" />
      <Inline justify="between">
        <Button
          v-if="version.number > 1"
          :as="NuxtLink"
          :to="`${base}/${version.number - 1}`"
          variant="ghost"
          tone="neutral"
          size="sm"
        >
          <template #icon><ChevronLeft /></template>
          上一个版本
        </Button>
        <Space v-else />
        <Button
          v-if="version.number < version.latest"
          :as="NuxtLink"
          :to="`${base}/${version.number + 1}`"
          variant="ghost"
          tone="neutral"
          size="sm"
        >
          下一个版本
          <template #trailing><ChevronRight /></template>
        </Button>
      </Inline>
    </PageBody>
  </Page>
  <WikiChangesUndo
    v-model:open="undoOpen"
    :edit="data.edit"
    :names="data.names"
    :entry="entry.id"
    @done="((undoOpen = false), emit('changed'))"
  />
  <AlertDialog
    v-model:open="restoreOpen"
    title="恢复到此版本"
    :description="`将此版本的内容填入编辑页${pending ? '，与尚未保存的修改不同的地方以此版本为准' : ''}，保存后生效。`"
    confirm-text="填入编辑页"
    cancel-text="取消"
    @confirm="restore"
  />
</template>
