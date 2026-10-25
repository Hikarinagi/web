<script setup lang="ts">
  import { Card, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { isEmpty, isMedia } from './field-diff/helpers'

  const props = defineProps<{
    op: Record<string, unknown>
    label: string
  }>()

  const OP_LABEL: Record<string, string> = {
    scalar: '修改字段',
    relation_add: '添加关系',
    relation_remove: '移除关系',
    relation_update: '修改关系',
  }

  const kind = computed(() => String(props.op.kind))

  const mode = computed(() => {
    if (kind.value === 'relation_add') return 'relation-add'
    if (kind.value === 'relation_remove') return 'relation-remove'
    if (kind.value === 'relation_update') return 'relation-update'
    if (kind.value !== 'scalar') return 'unknown'
    if (props.op.value_type === 'ref') return 'ref'
    if (props.op.value_type === 'object[]') {
      if (props.op.field === 'labels') return 'labels'
      if (props.op.field === 'external_links') return 'external-links'
      if (props.op.field === 'steam_apps') return 'steam-apps'
      return 'prices'
    }
    const from = props.op.from
    const to = props.op.to
    if (Array.isArray(from) || Array.isArray(to)) return 'array'
    if (isMedia(from) || isMedia(to)) return 'media'
    if (isEmpty(from)) return 'added'
    if (isEmpty(to)) return 'removed'
    if (
      typeof from === 'string' &&
      typeof to === 'string' &&
      (from.includes('\n') || to.includes('\n'))
    ) {
      return 'lines'
    }
    return 'inline'
  })
</script>

<template>
  <Card :padded="false" class="rounded-xl shadow-none">
    <Inline gap="sm" align="center" :wrap="false" class="border-b border-line px-4 py-2.5">
      <Tag size="sm" tone="neutral">{{ OP_LABEL[kind] ?? kind }}</Tag>
      <Text as="span" size="sm" weight="medium">{{ label }}</Text>
    </Inline>

    <Stack gap="none" class="p-4 text-sm">
      <CreatorChangesetFieldDiffBlock v-if="mode === 'added'" :op="op" variant="added" />
      <CreatorChangesetFieldDiffBlock v-else-if="mode === 'removed'" :op="op" variant="removed" />
      <CreatorChangesetFieldDiffInline v-else-if="mode === 'inline'" :op="op" />
      <CreatorChangesetFieldDiffRef v-else-if="mode === 'ref'" :op="op" />
      <CreatorChangesetFieldDiffPrices v-else-if="mode === 'prices'" :op="op" />
      <CreatorChangesetFieldDiffLabels v-else-if="mode === 'labels'" :op="op" />
      <CreatorChangesetFieldDiffExternalLinks v-else-if="mode === 'external-links'" :op="op" />
      <CreatorChangesetFieldDiffSteamApps v-else-if="mode === 'steam-apps'" :op="op" />
      <CreatorChangesetFieldDiffMedia v-else-if="mode === 'media'" :op="op" />
      <CreatorChangesetFieldDiffArray v-else-if="mode === 'array'" :op="op" />
      <CreatorChangesetFieldDiffLines v-else-if="mode === 'lines'" :op="op" />
      <CreatorChangesetFieldDiffRelationChip
        v-else-if="mode === 'relation-add'"
        :op="op"
        variant="add"
      />
      <CreatorChangesetFieldDiffRelationChip
        v-else-if="mode === 'relation-remove'"
        :op="op"
        variant="remove"
      />
      <CreatorChangesetFieldDiffRelationUpdate v-else-if="mode === 'relation-update'" :op="op" />
      <Text v-else tone="muted">关系目标 #{{ op.target_id }}</Text>
    </Stack>
  </Card>
</template>
