<script setup lang="ts">
  import { AlertDialog, Button, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'WikiHomeDrafts' })

  const store = useWikiDraftsStore()
  const items = computed(() =>
    Object.entries(store.drafts)
      .map(([key, draft]) => ({ key, ...draft, count: store.count(key) }))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
  )
  const total = computed(() => items.value.reduce((sum, item) => sum + item.count, 0))
  const dropping = ref<string | null>(null)
  onDeactivated(() => {
    dropping.value = null
  })
  const open = computed({
    get: () => dropping.value !== null,
    set: next => {
      if (!next) dropping.value = null
    },
  })
</script>

<template>
  <Panel v-if="items.length" title="未保存的修改" :count="total">
    <Stack gap="sm">
      <Inline
        v-for="item in items"
        :key="item.key"
        gap="sm"
        align="center"
        justify="between"
        :wrap="false"
        class="min-w-0"
      >
        <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
          <Link :as="NuxtLink" :to="item.path" class="min-w-0 truncate text-sm" lang="ja">
            {{ item.title }}
          </Link>
          <Text as="span" size="xs" tone="muted" class="shrink-0">
            {{ item.count }} 处修改，{{ revisionTime(item.updated_at) }}
          </Text>
        </Inline>
        <Button variant="ghost" tone="neutral" size="sm" @click="dropping = item.key">放弃</Button>
      </Inline>
    </Stack>
  </Panel>
  <AlertDialog
    v-model:open="open"
    title="放弃修改"
    tone="danger"
    confirm-text="放弃"
    cancel-text="保留"
    @confirm="dropping && store.discard(dropping)"
  />
</template>
