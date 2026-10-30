<script setup lang="ts">
  import { Alert, Button, Checkbox, Inline, Input, Stack, Text } from '@hina-ui/vue'
  import { Search } from '@lucide/vue'
  import { ENTRY_TYPE_NAMES, type BackendEntryDefinition } from '~/features/creator/entry/contract'
  import { useEntryDraft } from '~/features/creator/new/useEntryDraft'
  import { SOURCE_NAME } from '~/features/creator/sources'

  defineOptions({ name: 'CreatorNewWorkflow' })
  const props = defineProps<{ definitions: BackendEntryDefinition[] }>()
  provide(
    ENTRY_TYPE_NAMES,
    computed(() => Object.fromEntries(props.definitions.map(item => [item.type, item.label]))),
  )

  const {
    input,
    looking,
    lookup,
    draft,
    drafting,
    refusal,
    check,
    failures,
    similar,
    confirmed,
    saving,
    choice,
    ready,
    find,
    build,
    create,
  } = useEntryDraft()

  const source = computed(() => (lookup.value?.matches.length ? null : lookup.value?.source))
  const record = computed(() => source.value?.record_key?.split(':')[0] ?? null)
  const kind = computed(() =>
    record.value === 'moepedia' || record.value === 'steam' ? 'game' : 'book',
  )
  const missing = computed(() => {
    if (!source.value || source.value.record_key) return null
    if (source.value.kind === 'isbn') return '无法读取该 ISBN 的书目资料。'
    if (source.value.kind === 'jan') return '无法读取该 JAN 对应的资料。请改用商店页面的网址。'
    return null
  })
  const page = computed(() => source.value?.kind === 'url' && !source.value.record_key)
</script>

<template>
  <Stack gap="lg">
    <Inline gap="sm" :wrap="false">
      <Input
        v-model="input"
        placeholder="粘贴 ISBN、JAN 或网址，或输入标题"
        class="min-w-0 flex-1"
        @keydown.enter="find()"
      />
      <Button :loading="looking" :disabled="!input.trim()" @click="find()">
        <template #icon><Search /></template>
        查找
      </Button>
    </Inline>
    <template v-if="lookup">
      <CreatorNewEntries
        v-if="lookup.matches.length"
        title="站内已有"
        :entries="lookup.matches"
        edit
      />
      <CreatorNewEntries
        v-else-if="!lookup.source"
        title="站内条目"
        :entries="lookup.similar"
        empty-text="站内没有名称相似的条目"
      >
        <Text as="p" size="sm" tone="muted">要新建条目，请输入 ISBN、JAN 或网址。</Text>
      </CreatorNewEntries>
      <Alert :open="Boolean(missing)" tone="warning" :title="missing ?? undefined" />
      <template v-if="source && !missing">
        <CreatorNewDraft
          :draft="draft"
          :check="check"
          :failures="failures"
          :definitions="definitions"
          :from="record ? (SOURCE_NAME[record.toUpperCase()] ?? record) : source.url"
          :drafting="drafting"
          :ready="ready"
          :saving="saving"
          @create="create()"
        >
          <CreatorNewWebPage
            v-if="page"
            v-model:type="choice.type"
            v-model:title="choice.title"
            @change="build()"
          />
          <CreatorNewPlacement
            v-else
            v-model:placement="choice.placement"
            v-model:target="choice.target"
            v-model:medium="choice.medium"
            :kind="kind"
            :selected="draft?.target ?? null"
            @change="build()"
          />
          <Alert :open="refusal === 'target'" tone="info" title="选择新条目归入的条目" />
        </CreatorNewDraft>
        <CreatorNewEntries v-if="similar.length" title="可能重复" :entries="similar">
          <Checkbox v-model="confirmed" label="确认都不是同一条目" />
        </CreatorNewEntries>
      </template>
    </template>
  </Stack>
</template>
