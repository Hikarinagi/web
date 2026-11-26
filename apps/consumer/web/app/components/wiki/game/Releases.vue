<script setup lang="ts">
  import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    Empty,
    Heading,
    Inline,
    Link,
    SimpleGrid,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { ChevronDown, Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { entryState, type EditableEntry } from '~/features/wiki/editor/draft'
  import { codeLabel, dateText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiGameReleases' })

  const props = defineProps<{ game: EditableEntry; selected: number | null }>()
  const editor = inject(ENTRY_EDITOR)!
  const parts = useEditorParts(editor, () => ({
    id: props.game.id,
    type: props.game.type,
    label: props.game.label,
  }))
  const route = useRoute()
  const nav = usePageNav()
  const { can } = useCreatorPermissions()
  const deletable = computed(() => can(WIKI_PERMISSIONS.DELETE))
  const base = computed(() => `/entries/${props.game.id}/edit/releases`)
  const releases = computed(() => parts.entriesOf('PRODUCT'))
  const current = computed(
    () => releases.value.find(item => item.id === props.selected) ?? releases.value[0] ?? null,
  )
  const deleted = (id: number) => id in editor.draft.value.deleted
  const stateOf = (id: number) =>
    entryState(editor.draft.value, statement => editor.statements.value.get(statement)?.entry, id)
  const link = (id: number) => ({ path: `${base.value}/${id}`, query: route.query })

  function drop(id: number) {
    editor.uncreate(id)
    void nav.push({ path: base.value, query: route.query })
  }
  const definition = computed(() => editor.definitions.value.get('PRODUCT'))
  const titleOf = (id: number) => parts.first(id, 'TITLE')?.text || '未命名的发行版本'
  const factsOf = (id: number) => {
    const date = parts.first(id, 'RELEASE_DATE')
    return [
      ...parts
        .values(id, 'PLATFORM')
        .map(item => (item.code ? codeLabel('PLATFORM', item.code) : '')),
      date?.date ? dateText(date.date, date.date_precision) : '',
    ]
      .filter(Boolean)
      .join('，')
  }

  function add() {
    const id = parts.create('PRODUCT', [
      ['INCLUDED_GAME', { target: { id: props.game.id, type: 'GAME', label: props.game.label } }],
      ['TITLE', { text: parts.first(props.game.id, 'TITLE')?.text ?? props.game.label }],
    ])
    void nav.push(`${base.value}/${id}`)
  }

  function copy(source: number) {
    void nav.push(`${base.value}/${parts.copy(source, 'PRODUCT')}`)
  }
</script>

<template>
  <Stack gap="lg">
    <Stack gap="sm">
      <Inline gap="sm" align="center" justify="between">
        <Text size="sm" tone="muted">共 {{ releases.length }} 个发行版本</Text>
        <Inline gap="sm">
          <DropdownMenu v-if="releases.length" align="end">
            <Button size="sm" variant="ghost" tone="neutral">
              复制已有的发行版本
              <template #trailing><ChevronDown /></template>
            </Button>
            <template #content>
              <DropdownMenuItem v-for="item in releases" :key="item.id" @select="copy(item.id)">
                {{ titleOf(item.id) }}
              </DropdownMenuItem>
            </template>
          </DropdownMenu>
          <Button size="sm" variant="outline" tone="neutral" @click="add">
            <template #icon><Plus /></template>
            新建发行版本
          </Button>
        </Inline>
      </Inline>
      <SimpleGrid v-if="releases.length" min="15rem" gap="sm">
        <WikiEditorEntryCard
          v-for="item in releases"
          :key="item.id"
          :to="link(item.id)"
          :active="item.id === current?.id"
          :state="stateOf(item.id)"
          :title="titleOf(item.id)"
          :facts="factsOf(item.id)"
          empty="暂无发售日"
          :cover="parts.first(item.id, 'COVER')?.media ?? null"
        >
          <template #menu>
            <WikiGameReleaseMenu
              :release="item.id"
              :deleted="deleted(item.id)"
              :deletable="deletable"
              @erase="on => editor.erase(item.id, on)"
              @drop="drop(item.id)"
            />
          </template>
        </WikiEditorEntryCard>
      </SimpleGrid>
    </Stack>
    <Stack v-if="current && definition" gap="lg">
      <Inline gap="md" align="center" :wrap="false">
        <Heading :level="2" size="sm" lang="ja" class="min-w-0 truncate">
          {{ titleOf(current.id) }}
        </Heading>
        <Tag v-if="deleted(current.id)" tone="danger">将删除</Tag>
        <Inline gap="sm" align="center" :wrap="false" class="ms-auto shrink-0">
          <Button
            v-if="current.id < 0"
            size="sm"
            variant="ghost"
            tone="neutral"
            @click="drop(current.id)"
          >
            取消新建
          </Button>
          <template v-else>
            <Button
              v-if="deleted(current.id)"
              size="sm"
              variant="ghost"
              tone="neutral"
              @click="editor.erase(current.id, false)"
            >
              撤销删除
            </Button>
            <Button
              v-else-if="deletable"
              size="sm"
              variant="ghost"
              tone="danger"
              @click="editor.erase(current.id, true)"
            >
              删除发行版本
            </Button>
            <Link :as="NuxtLink" :to="`/entries/${current.id}/history`" class="text-sm">
              此版本的修改记录
            </Link>
          </template>
        </Inline>
      </Inline>
      <WikiEditorForm
        :entry="current"
        :definition="definition"
        :columns="2"
        :inert="deleted(current.id) || undefined"
      />
    </Stack>
    <Empty v-else title="暂无发行版本" />
  </Stack>
</template>
