<script setup lang="ts">
  import {
    Button,
    Empty,
    Inline,
    Link,
    Panel,
    SearchInput,
    SegmentedControl,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { describeFound, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiNewLookup' })

  type Kind = 'GAME' | 'SERIES' | 'PERSON' | 'ORGANIZATION'

  const emit = defineEmits<{ create: [type: Kind, name: string] }>()
  const route = useRoute()
  const router = useRouter()
  const { typeName } = useWikiDefinitions()
  const KINDS: { value: Kind; label: string }[] = [
    { value: 'GAME', label: '游戏' },
    { value: 'SERIES', label: '轻小说或漫画' },
    { value: 'PERSON', label: '人物' },
    { value: 'ORGANIZATION', label: '组织' },
  ]

  const type = computed<Kind>(
    () => KINDS.find(item => item.value === route.query.type)?.value ?? 'GAME',
  )
  const name = ref(typeof route.query.q === 'string' ? route.query.q : '')
  const found = shallowRef<WikiSearchItem[]>([])
  const searched = ref(false)
  let sequence = 0

  function setQuery(next: { type?: Kind; q?: string }) {
    void router.replace({ query: { ...route.query, ...next } })
  }

  function pick(value: unknown) {
    const kind = KINDS.find(item => item.value === value)?.value
    if (kind) setQuery({ type: kind })
  }

  watchDebounced(
    [name, type],
    async ([text, kind]) => {
      const seq = ++sequence
      const keyword = text.trim()
      setQuery({ q: keyword || undefined })
      if (!keyword) {
        found.value = []
        searched.value = false
        return
      }
      const items = await hikariRequest('/api/v3/wiki/entries', {
        query: { q: keyword.slice(0, 100), types: [kind] },
        toast: false,
      }).catch(() => [] as WikiSearchItem[])
      if (seq !== sequence) return
      found.value = items
      searched.value = true
    },
    { debounce: 300, immediate: true },
  )
</script>

<template>
  <Panel title="先查找已有的条目">
    <Stack gap="md">
      <SegmentedControl
        :model-value="type"
        :options="KINDS"
        size="sm"
        class="self-start"
        @update:model-value="pick"
      />
      <SearchInput v-model="name" placeholder="名字" />
      <Empty v-if="searched && !found.length" :title="`没有找到「${name.trim()}」`" />
      <Stack v-else-if="found.length" gap="sm">
        <Inline v-for="item in found" :key="item.id" gap="sm" align="baseline" :wrap="false">
          <Link :as="NuxtLink" :to="`/entries/${item.id}/edit`" lang="ja" class="text-sm">
            {{ item.label }}
          </Link>
          <Text as="span" size="xs" tone="muted" truncate>
            {{ describeFound(item, typeName(item.type)) }}
          </Text>
        </Inline>
      </Stack>
      <Button
        v-if="searched"
        variant="outline"
        tone="neutral"
        size="sm"
        class="self-start"
        @click="emit('create', type, name.trim())"
      >
        <template #icon><Plus /></template>
        新建「{{ name.trim() }}」
      </Button>
    </Stack>
  </Panel>
</template>
