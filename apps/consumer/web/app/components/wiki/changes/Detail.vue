<script setup lang="ts">
  import { Button, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { CHANGE_PARTS_PAGE_SIZE, changeLines, shownEntries } from '~/features/wiki/changes'
  import { RELOAD_CHANGES } from '~/features/wiki/composables/useChangesResults'
  import type { ChangePageData } from '~~/server/api/pages/create/wiki/changes/[id].get'

  defineOptions({ name: 'WikiChangesDetail' })

  const props = defineProps<{ data: ChangePageData; back: string; backLabel: string }>()
  const emit = defineEmits<{ changed: [] }>()
  const route = useRoute()
  const nav = usePageNav()
  const auth = useAuthStore()
  const { canAny } = useCreatorPermissions()
  const reloadList = inject(RELOAD_CHANGES, () => {})

  const edit = computed(() => props.data.edit)
  const patrol = computed(() => canAny(WIKI_PERMISSIONS.PATROL))
  const parts = computed(() =>
    shownEntries(edit.value.entries.map(part => ({ ...part, type: part.entry.type }))),
  )
  const lines = computed(() =>
    changeLines({
      summary: edit.value.summary,
      entries: edit.value.entries.map(part => ({ ...part.entry, ...part })),
    }),
  )
  const meta = computed(() => ({
    page: props.data.page,
    page_size: CHANGE_PARTS_PAGE_SIZE,
    total_items: edit.value.entry_count,
    item_count: edit.value.entries.length,
    total_pages: Math.ceil(edit.value.entry_count / CHANGE_PARTS_PAGE_SIZE),
  }))
  const undoable = computed(
    () =>
      !edit.value.batch.imported &&
      !edit.value.reverted_at &&
      (edit.value.entry_count === 1 || edit.value.editor.id === auth.user?.id || patrol.value),
  )
  const active = usePageActive()
  const undoOpen = computed({
    get: () => active.value && route.query.panel === 'undo',
    set: next => {
      if (!next) void nav.close(['panel'])
    },
  })

  const marking = ref(false)
  async function mark() {
    marking.value = true
    try {
      await hikariRequest('/api/v3/wiki/edits/patrols', {
        method: 'POST',
        body: { edit_ids: [edit.value.id] },
      })
      emit('changed')
      reloadList()
    } finally {
      marking.value = false
    }
  }

  function undone() {
    undoOpen.value = false
    emit('changed')
    reloadList()
  }
</script>

<template>
  <Stack gap="none">
    <Inline gap="none" align="center" class="h-12 border-b border-line px-2 md:hidden">
      <Button :as="NuxtLink" :to="back" variant="ghost" tone="neutral" size="sm">
        <template #icon><ArrowLeft /></template>
        {{ backLabel }}
      </Button>
    </Inline>
    <Stack gap="lg" class="p-6 max-md:p-4">
      <Inline gap="md" align="start" justify="between">
        <Stack gap="xs" class="min-w-0">
          <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
            <Avatar :user="edit.editor" size="sm" />
            <UserName :user="edit.editor" class="text-sm" full />
            <Text as="span" size="sm" tone="muted" class="shrink-0">
              {{ revisionTime(edit.created_at) }}
            </Text>
          </Inline>
          <Text v-if="edit.note" size="sm">{{ edit.note }}</Text>
          <Text v-if="lines.length === 1" size="sm" tone="muted">{{ lines[0]?.text }}</Text>
          <WikiBasis v-if="edit.basis" :basis="edit.basis" />
          <Text v-if="edit.patrolled_at" size="sm" tone="success">
            已检查，{{ revisionTime(edit.patrolled_at) }}
          </Text>
          <Text v-if="edit.reverted_at" size="sm" tone="muted">
            已于 {{ revisionTime(edit.reverted_at) }} 撤销
          </Text>
          <Text v-if="edit.reverts_id" size="sm" tone="muted">
            撤销了
            <Link :as="NuxtLink" :to="`/create/wiki/changes/${edit.reverts_id}`">另一次修改</Link>
          </Text>
        </Stack>
        <Inline gap="sm" :wrap="false">
          <Button
            v-if="undoable"
            variant="outline"
            tone="neutral"
            size="sm"
            @click="nav.query({ panel: 'undo' })"
          >
            撤销
          </Button>
          <Button
            v-if="patrol && !edit.patrolled_at && !edit.batch.imported"
            size="sm"
            :loading="marking"
            @click="mark"
          >
            标记已检查
          </Button>
        </Inline>
      </Inline>
      <WikiChangesPart
        v-for="part in parts"
        :key="part.entry.id"
        :part="part"
        :names="data.names"
        :several="lines.length > 1"
      />
      <Paginator
        v-if="meta.total_pages > 1"
        :meta="meta"
        route="push"
        page-param="entry_page"
        align="center"
      />
    </Stack>
    <WikiChangesUndo v-model:open="undoOpen" :edit="edit" :names="data.names" @done="undone" />
  </Stack>
</template>
