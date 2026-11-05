<script setup lang="ts">
  import { editKey } from '~/features/creator/tabs'
  import { partsOf } from '~/features/wiki/editor/route'
  import type { EditorPageData } from '~~/server/api/pages/entries/[id]/edit.get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit', 'wiki-editor-target'],
    floatingToolbar: false,
    fill: true,
    title: '编辑条目',
    key: route => `/entries/${String(route.params.id)}/edit`,
  })

  const route = useRoute()
  const { data, error, status, refresh } = useHikariApiData<EditorPageData>(
    `/api/pages/entries/${String(route.params.id)}/edit`,
  )

  const drafts = useWikiDraftsStore()
  useRefreshOnSaved(
    () => (data.value?.entry && drafts.count(editKey(data.value.entry.id)) ? undefined : refresh()),
    () =>
      data.value?.entry ? [data.value.entry.id, ...data.value.parts.map(part => part.id)] : null,
  )

  useCreatorPage({
    loading: () => !data.value && status.value === 'pending',
    title: () => (data.value?.entry ? data.value.entry.label || '未命名' : undefined),
    kind: () => data.value?.entry?.type,
    crumbs: () => {
      const entry = data.value?.entry
      if (!entry) return undefined
      const owner = data.value?.owner
      const segments = Array.isArray(route.params.path) ? route.params.path : []
      const part = partsOf(entry.type).find(item => item.key === segments[0])
      return [
        ...(owner
          ? [
              { label: owner.label, to: `/entries/${owner.id}/edit` },
              { label: '出场角色', to: `/entries/${owner.id}/edit/cast` },
            ]
          : []),
        { label: entry.label || '未命名', to: `/entries/${entry.id}/edit` },
        ...(part ? [{ label: part.label }] : []),
      ]
    },
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiEditor
    v-else-if="data?.entry"
    :entry="data.entry"
    :parts="data.parts"
    :owner="data.owner"
    :versions="data.versions"
    :definitions="data.definitions"
    :hints="data.hints"
    :history="data.history"
    :references="data.references"
    :watched="data.watched"
    @saved="refresh()"
  />
</template>
