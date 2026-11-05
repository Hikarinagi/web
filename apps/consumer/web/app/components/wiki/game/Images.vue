<script setup lang="ts">
  import { AspectRatio, Card, Empty, Panel, SimpleGrid, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiGameImages' })

  const props = defineProps<{ game: EditableEntry }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const parts = useEditorParts(editor, () => ({
    id: props.game.id,
    type: props.game.type,
    label: props.game.label,
  }))
  const releases = computed(() => parts.entriesOf('PRODUCT'))
  const cover = computed(() =>
    editor.definitions.value.get('PRODUCT')?.properties.find(item => item.property === 'COVER'),
  )
  const samples = computed(() =>
    editor.definitions.value.get('GAME')?.properties.find(item => item.property === 'SAMPLE_IMAGE'),
  )
</script>

<template>
  <Panel title="各发行版本的封面">
    <template v-if="cover?.clauses.length" #actions>
      <WikiFieldRule label="封面" :clauses="cover.clauses" />
    </template>
    <Empty v-if="!releases.length" title="暂无发行版本" />
    <SimpleGrid v-else min="9rem" gap="md">
      <Card
        v-for="release in releases"
        :key="release.id"
        :as="NuxtLink"
        :to="{ path: `/entries/${game.id}/edit/releases/${release.id}`, query: route.query }"
        :padded="false"
        class="hn-state-layer hn-interactive overflow-hidden"
      >
        <AspectRatio :ratio="3 / 4" class="bg-inset">
          <HikariImage
            v-if="parts.first(release.id, 'COVER')?.media"
            :src="parts.first(release.id, 'COVER')!.media"
            alt=""
            preset="small"
            class="size-full"
            image-class="size-full object-cover"
          />
        </AspectRatio>
        <Text size="xs" tone="muted" lang="ja" truncate class="block px-2 py-1.5">
          {{ parts.first(release.id, 'TITLE')?.text || '新的发行版本' }}
        </Text>
      </Card>
    </SimpleGrid>
  </Panel>
  <Panel v-if="samples" title="示例 CG 与截图">
    <template v-if="samples.clauses.length" #actions>
      <WikiFieldRule label="示例 CG 与截图" :clauses="samples.clauses" />
    </template>
    <WikiFieldProperty bare :entry="game.id" :definition="samples" label="示例 CG 与截图" />
  </Panel>
</template>
