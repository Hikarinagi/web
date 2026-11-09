<script setup lang="ts">
  import { CloseButton, Inline, Input, Select, Stack, Text } from '@hina-ui/vue'
  import { SONG_KIND_LABELS } from '~/features/entry/labels'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import type { ExtraKind } from '~/features/wiki/editor/inputs'

  defineOptions({ name: 'WikiFieldExtras' })

  const model = defineModel<ValueDraft>({ required: true })
  const extras = defineModel<ExtraKind[]>('extras', { required: true })

  const patch = (fields: Partial<ValueDraft>) => (model.value = { ...model.value, ...fields })
  const kinds = Object.entries(SONG_KIND_LABELS).map(([value, label]) => ({ value, label }))

  function drop(kind: ExtraKind) {
    extras.value = extras.value.filter(item => item !== kind)
    if (kind === 'reading') patch({ reading: null })
    if (kind === 'song') patch({ song: null, song_kind: null })
    if (kind === 'archive') patch({ archive_url: null })
  }
</script>

<template>
  <Stack v-if="extras.length" gap="xs">
    <Inline v-if="extras.includes('reading')" gap="sm" align="center" :wrap="false">
      <Text as="span" size="sm" tone="muted" class="w-16 shrink-0">读音</Text>
      <Input
        :model-value="model.reading ?? ''"
        aria-label="读音"
        class="min-w-0 flex-1"
        @update:model-value="value => patch({ reading: String(value) })"
      />
      <CloseButton label="去掉读音" @click="drop('reading')" />
    </Inline>
    <Inline v-if="extras.includes('song')" gap="sm" align="center" :wrap="false">
      <Text as="span" size="sm" tone="muted" class="w-16 shrink-0">歌曲</Text>
      <Input
        :model-value="model.song ?? ''"
        aria-label="歌名"
        placeholder="歌名"
        lang="ja"
        class="min-w-0 flex-1"
        @update:model-value="value => patch({ song: String(value) })"
      />
      <Select
        :model-value="model.song_kind"
        :options="kinds"
        aria-label="歌曲类别"
        placeholder="类别"
        class="w-32 shrink-0"
        @update:model-value="value => patch({ song_kind: value ? String(value) : null })"
      />
      <CloseButton label="去掉歌曲" @click="drop('song')" />
    </Inline>
    <Inline v-if="extras.includes('archive')" gap="sm" align="center" :wrap="false">
      <Text as="span" size="sm" tone="muted" class="w-16 shrink-0">存档地址</Text>
      <Input
        :model-value="model.archive_url ?? ''"
        type="url"
        placeholder="https://"
        aria-label="存档地址"
        class="min-w-0 flex-1"
        @update:model-value="value => patch({ archive_url: String(value) })"
      />
      <CloseButton label="去掉存档地址" @click="drop('archive')" />
    </Inline>
  </Stack>
</template>
