<script setup lang="ts">
  import {
    Button,
    Card,
    Empty,
    IconButton,
    Inline,
    Panel,
    Ripple,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ExternalLink, Globe } from '@lucide/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { BackendExternalMatch } from '~/features/creator/duplicates'
  import { hasVndb, oneClickEndpoint, type ImportType } from '~/features/creator/editor/import'

  const props = defineProps<{ type: ImportType; items: BackendExternalMatch[] }>()

  const { can } = useCreatorPermissions()
  const { confirm } = useHikariConfirm()
  const picked = ref<Partial<Record<BackendExternalMatch['source'], BackendExternalMatch>>>({})
  const importing = ref(false)

  watch(
    () => props.items,
    () => {
      picked.value = {}
    },
  )

  const both = computed(() => hasVndb(props.type))
  const oneClickUrl = computed(() =>
    can(WIKI_PERMISSIONS.REVIEW) ? oneClickEndpoint(props.type) : null,
  )
  const hasPick = computed(() => !!picked.value.bangumi || !!picked.value.vndb)

  function isPicked(item: BackendExternalMatch) {
    return picked.value[item.source]?.external_id === item.external_id
  }

  function toggle(item: BackendExternalMatch) {
    const next = both.value ? { ...picked.value } : {}
    next[item.source] = isPicked(item) ? undefined : item
    picked.value = next
  }

  function sourceUrl(item: BackendExternalMatch) {
    if (item.source === 'vndb') return `https://vndb.org/${item.external_id}`
    const kind =
      props.type === 'person' ? 'person' : props.type === 'character' ? 'character' : 'subject'
    return `https://bgm.tv/${kind}/${item.external_id}`
  }

  function openEditor() {
    const params = new URLSearchParams()
    if (picked.value.bangumi) params.set('bangumi_id', picked.value.bangumi.external_id)
    if (picked.value.vndb) params.set('vndb_id', picked.value.vndb.external_id)
    void navigateTo(`/create/new/${props.type}?${params.toString()}`)
  }

  function go(result: { existing_id?: number | null; change_request_id?: number | null }) {
    if (result.existing_id) void navigateTo(`/create/edit/${props.type}/${result.existing_id}`)
    else if (result.change_request_id) {
      void navigateTo(`/create/contributions/${result.change_request_id}`)
    }
  }

  async function oneClick(force = false) {
    if (!hasPick.value || importing.value || !oneClickUrl.value) return
    importing.value = true
    try {
      if (oneClickUrl.value === '/api/v3/light-novel-import') {
        if (!picked.value.bangumi) return
        go(
          await hikariRequest('/api/v3/light-novel-import', {
            method: 'POST',
            body: { bangumi_id: picked.value.bangumi.external_id },
          }),
        )
        return
      }
      const result = await hikariRequest('/api/v3/galgame-import', {
        method: 'POST',
        body: {
          bangumi_id: picked.value.bangumi?.external_id,
          vndb_id: picked.value.vndb?.external_id,
          confirm: force,
        },
      })
      if (result.change_request_id || result.existing_id) return go(result)
      if (result.sources_match === false) {
        confirm({
          title: '两源可能不是同一作品',
          description: 'Bangumi 与 VNDB 选中的条目标题差异较大，确认仍要合并导入吗？',
          confirmText: '仍要合并',
          cancelText: '取消',
          onConfirm: () => oneClick(true),
        })
      }
    } finally {
      importing.value = false
    }
  }
</script>

<template>
  <Panel
    :title="both ? 'Bangumi 与 VNDB' : 'Bangumi'"
    :count="items.length"
    :description="both && items.length ? '每个来源最多选择一项结果；两者将并入新条目。' : undefined"
  >
    <template #icon><Globe /></template>
    <template v-if="items.length" #actions>
      <Button
        v-if="oneClickUrl"
        variant="outline"
        tone="neutral"
        size="sm"
        :disabled="!hasPick"
        :loading="importing"
        @click="oneClick()"
      >
        一键导入
      </Button>
      <Button size="sm" :disabled="!hasPick || importing" @click="openEditor">以此新建</Button>
    </template>

    <Empty v-if="items.length === 0" size="sm" title="Bangumi 上没有匹配的条目" />
    <Stack v-else gap="sm">
      <Inline
        v-for="item in items"
        :key="`${item.source}:${item.external_id}`"
        gap="sm"
        align="center"
        :wrap="false"
      >
        <Card
          as="button"
          type="button"
          :padded="false"
          :aria-pressed="isPicked(item)"
          :class="
            cn(
              'hn-state-layer min-w-0 flex-1 hn-interactive text-start hn-press-lg',
              isPicked(item) && 'border-accent bg-accent-soft ring-2 ring-accent-soft',
            )
          "
          @click="toggle(item)"
        >
          <Ripple />
          <Inline gap="md" align="start" :wrap="false" class="p-3">
            <HikariImage
              :src="item.cover ?? ''"
              alt=""
              preset="small"
              class="h-20 w-15 shrink-0 rounded bg-subtle"
              image-class="size-full object-cover"
            >
              <template #empty />
              <template #error />
            </HikariImage>
            <Stack gap="xs" class="min-w-0 flex-1">
              <Inline gap="sm" align="center">
                <Text weight="medium" truncate class="min-w-0">{{ item.title }}</Text>
                <Tag size="sm" tone="neutral">{{
                  item.source === 'vndb' ? 'VNDB' : 'Bangumi'
                }}</Tag>
              </Inline>
              <Text v-if="item.subtitle" size="sm" tone="muted" truncate>{{ item.subtitle }}</Text>
              <Text size="xs" tone="muted" truncate>
                {{ [item.authors?.join('、'), item.year].filter(Boolean).join(' · ') }}
              </Text>
            </Stack>
          </Inline>
        </Card>
        <IconButton
          as="a"
          :href="sourceUrl(item)"
          target="_blank"
          rel="noopener"
          variant="ghost"
          tone="neutral"
          :label="item.source === 'vndb' ? '在 VNDB 查看' : '在 Bangumi 查看'"
        >
          <ExternalLink />
        </IconButton>
      </Inline>
    </Stack>
  </Panel>
</template>
