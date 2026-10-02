<script setup lang="ts">
  import { Alert, Button, Checkbox, Inline, Link, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'

  type Note = NonNullable<WorkbenchMangaProjectPageData['review']>['notes'][number]

  const props = defineProps<{
    project: WorkbenchMangaProjectPageData['project']
    review: WorkbenchMangaProjectPageData['review']
    pages: WorkbenchMangaProjectPageData['pages']
    pendingChange: WorkbenchMangaProjectPageData['pending_change']
  }>()
  const emit = defineEmits<{ jump: [note: Note] }>()

  const member = computed(() => !!props.project.viewer_role)
  const resolvable = computed(() => props.project.viewer_capabilities.includes('translate'))
  const rejected = computed(
    () => member.value && props.project.status !== 'REVIEW' && props.review?.status === 'REJECTED',
  )
  const notes = ref<Note[]>(props.review?.notes ?? [])
  watch(
    () => props.review?.notes,
    value => {
      notes.value = value ?? []
    },
  )
  const resolved = computed(() => notes.value.filter(note => note.resolved_at).length)
  const pageNumber = (id: number) => props.pages.findIndex(page => page.id === id) + 1

  async function toggle(note: Note, value: boolean) {
    const next = await hikariRequest('/api/v3/manga-project-notes/{note_id}/resolved', {
      method: 'put',
      path: { note_id: note.id },
      body: { resolved: value },
    })
    notes.value = notes.value.map(item => (item.id === note.id ? next : item))
  }
</script>

<template>
  <Alert :open="!!pendingChange" tone="info" :closable="false">
    <Inline gap="sm" align="center">
      <Text as="span" size="sm">对章节信息的更改正在等待审核。</Text>
      <NuxtLink
        v-if="pendingChange"
        v-slot="{ href, navigate }"
        :to="`/create/contributions/${pendingChange.id}`"
        custom
      >
        <Link :href="href ?? undefined" @click="navigate">查看</Link>
      </NuxtLink>
    </Inline>
  </Alert>
  <Alert :open="member && project.status === 'REVIEW'" tone="info" :closable="false">
    正在审核中。在审核完成之前你无法进行更改。
  </Alert>
  <Alert :open="rejected" tone="warning" :closable="false" title="审核员退回了此投稿">
    <Stack gap="sm">
      <Text v-if="review?.reasons.length" size="sm">{{ review.reasons.join('；') }}</Text>
      <template v-if="notes.length">
        <Text size="xs" tone="muted">已处理 {{ resolved }} 条批注（共 {{ notes.length }} 条）</Text>
        <ScrollArea class="max-h-40">
          <Stack gap="xs">
            <Inline v-for="note in notes" :key="note.id" gap="sm" align="center" :wrap="false">
              <Checkbox
                :model-value="!!note.resolved_at"
                :disabled="!resolvable"
                aria-label="标记为已处理"
                @update:model-value="value => toggle(note, !!value)"
              />
              <Text size="xs" tone="muted" class="shrink-0 tabular-nums">
                第 {{ pageNumber(note.region.page_id) }} 页
              </Text>
              <Text
                size="sm"
                truncate
                :class="cn('min-w-0 flex-1', note.resolved_at && 'text-muted line-through')"
              >
                {{ note.content }}
              </Text>
              <Button variant="link" size="sm" class="shrink-0" @click="emit('jump', note)">
                转到文本框
              </Button>
            </Inline>
          </Stack>
        </ScrollArea>
      </template>
    </Stack>
  </Alert>
</template>
