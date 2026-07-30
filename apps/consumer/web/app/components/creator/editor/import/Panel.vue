<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { hasVndb, oneClickEndpoint, type ImportType } from '~/features/creator/editor/import'

  type SearchItem = ApiData<'/api/v3/external-source/{source}/search', 'get'>[number]

  const props = defineProps<{ type: ImportType }>()

  provide('$pcFormField', undefined)
  provide('$pcForm', undefined)

  const confirm = useConfirm()
  const bangumi = ref<SearchItem | null>(null)
  const vndb = ref<SearchItem | null>(null)
  const importing = ref(false)

  const { can } = useCreatorPermissions()
  const showVndb = computed(() => hasVndb(props.type))
  const oneClickUrl = computed(() =>
    can(WIKI_PERMISSIONS.REVIEW) ? oneClickEndpoint(props.type) : null,
  )
  const hasAny = computed(() => !!bangumi.value || (showVndb.value && !!vndb.value))

  function toEditor() {
    if (!hasAny.value) return
    const params = new URLSearchParams()
    if (bangumi.value) params.set('bangumi_id', bangumi.value.external_id)
    if (showVndb.value && vndb.value) params.set('vndb_id', vndb.value.external_id)
    void navigateTo(`/create/new/${props.type}?${params.toString()}`)
  }

  function go(result: { existing_id?: number | null; change_request_id?: number | null }) {
    if (result.existing_id) void navigateTo(`/create/edit/${props.type}/${result.existing_id}`)
    else if (result.change_request_id) {
      void navigateTo(`/create/contributions/${result.change_request_id}`)
    }
  }

  async function importGalgame(force: boolean) {
    const result = await hikariRequest('/api/v3/galgame-import', {
      method: 'POST',
      body: {
        bangumi_id: bangumi.value?.external_id,
        vndb_id: vndb.value?.external_id,
        confirm: force,
      },
    })
    if (result.change_request_id || result.existing_id) return go(result)
    if (result.sources_match === false) {
      confirm.require({
        group: 'app-shell',
        header: '两源可能不是同一作品',
        message: 'Bangumi 与 VNDB 选中的条目标题差异较大,确认仍要合并导入吗?',
        acceptLabel: '仍要合并',
        rejectLabel: '取消',
        onAccept: ({ close }: { close: () => void }) => {
          close()
          void oneClick(true)
        },
      })
    }
  }

  async function importLn() {
    const result = await hikariRequest('/api/v3/light-novel-import', {
      method: 'POST',
      body: { bangumi_id: bangumi.value!.external_id },
    })
    go(result)
  }

  async function oneClick(force = false) {
    if (!hasAny.value || importing.value || !oneClickUrl.value) return
    importing.value = true
    try {
      if (oneClickUrl.value === '/api/v3/galgame-import') await importGalgame(force)
      else await importLn()
    } finally {
      importing.value = false
    }
  }
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-surface-200 p-4 dark:border-surface-800">
    <p class="text-sm text-muted-color">
      <template v-if="showVndb">可填 Bangumi、VNDB 任一或两者,两源数据自动合并。</template>
      <template v-else>从 Bangumi 书籍条目获取数据。</template>
    </p>
    <div class="grid gap-4" :class="showVndb ? 'sm:grid-cols-2' : ''">
      <CreatorEditorImportSourceSearch
        v-model="bangumi"
        source="bangumi"
        label="Bangumi"
        :type="type"
      />
      <CreatorEditorImportSourceSearch
        v-if="showVndb"
        v-model="vndb"
        source="vndb"
        label="VNDB"
        :type="type"
      />
    </div>
    <div class="flex flex-wrap items-center justify-end gap-3">
      <Button label="预填编辑器" :disabled="!hasAny || importing" @click="toEditor" />
      <Button
        v-if="oneClickUrl"
        label="一键导入"
        severity="secondary"
        outlined
        :disabled="!hasAny"
        :loading="importing"
        @click="oneClick()"
      />
    </div>
  </div>
</template>
