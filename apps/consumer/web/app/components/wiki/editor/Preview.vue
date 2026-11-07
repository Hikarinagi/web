<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { Button, Card, Inline, ScrollArea, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { editBody } from '~/features/wiki/composables/useSaveFlow'

  defineOptions({ name: 'WikiEditorPreview' })

  type Derived = ApiData<'/api/v3/galgames/{id}/previews', 'post'>

  const props = defineProps<{ galgame: number }>()
  const editor = inject(ENTRY_EDITOR)!
  const { data: page, refresh } = useHikariApiData<GalgamePageData>(
    `/api/pages/galgames/${props.galgame}`,
    { lazy: true, server: false },
  )
  const derived = shallowRef<Derived | null>(null)
  const count = computed(() => editor.count.value)
  let sequence = 0

  async function load() {
    if (!count.value) return
    const current = ++sequence
    const next = await hikariRequest('/api/v3/galgames/{id}/previews', {
      method: 'POST',
      path: { id: props.galgame },
      body: editBody(editor),
    }).catch(() => null)
    if (current === sequence && next) derived.value = next
  }
  onMounted(load)
  watchDebounced(() => editor.draft.value, load, { debounce: 600, deep: true })
  watch(count, async (next, previous) => {
    if (next || !previous) return
    sequence++
    await refresh()
    derived.value = null
  })

  const data = computed(() => {
    if (!page.value) return null
    if (derived.value) return { ...page.value, ...derived.value }
    return count.value ? null : page.value
  })
  const nav = usePageNav()
</script>

<template>
  <Stack gap="md" class="min-h-0 flex-1">
    <Card :padded="false" class="shrink-0">
      <Inline gap="md" align="center" justify="between" :wrap="false" class="px-4 py-3">
        <Inline gap="sm" align="center" :wrap="false">
          <Button variant="ghost" tone="neutral" size="sm" @click="nav.close(['panel'])">
            <template #icon><ArrowLeft /></template>
            返回编辑
          </Button>
          <Text size="sm" :tone="count ? undefined : 'muted'">
            {{ count ? `已修改 ${count} 处` : '没有未保存的修改' }}
          </Text>
        </Inline>
        <Button size="sm" :disabled="!count" @click="nav.query({ save: '1' })">保存</Button>
      </Inline>
    </Card>
    <ScrollArea class="min-h-0 flex-1">
      <GalgamePage
        v-if="data"
        :data="data"
        :galgame-id="galgame"
        embedded
        inert
        class="[--app-header-height:0px]"
      />
      <Stack v-else gap="md">
        <Skeleton class="h-96" />
        <Skeleton class="h-48" />
      </Stack>
    </ScrollArea>
  </Stack>
</template>
