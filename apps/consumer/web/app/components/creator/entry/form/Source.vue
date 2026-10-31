<script setup lang="ts">
  import {
    Button,
    FormField,
    Inline,
    Input,
    Link,
    SegmentedControl,
    Spinner,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import { Link as LinkIcon, Plus } from '@lucide/vue'
  import type { MediaValue } from '~/components/media-library/types'
  import type {
    BackendPropertyDefinition,
    BackendSource,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'
  import { sourcesOf } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFormSource' })
  const props = defineProps<{
    source: BackendSource | null
    reading: boolean
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
    uploading: boolean
  }>()
  const values = defineModel<StatementValues>('values', { required: true })
  const shots = defineModel<{ media: MediaValue; name: string }[]>('shots', { required: true })
  defineEmits<{ read: []; upload: [files: File[]] }>()

  const existing = computed(() => (props.statement ? sourcesOf(props.statement) : []))
  const adding = ref(!existing.value.length)
  const page = computed(
    () => !props.source?.record_key && /^https?:\/\//i.test(values.value.source.trim()),
  )
  const METHODS = [
    { value: 'link', label: '网址或编号' },
    { value: 'screenshot', label: '作品截图' },
  ]
  const method = (value: string | number | undefined) =>
    (values.value.method = value === 'screenshot' ? 'screenshot' : 'link')
</script>

<template>
  <Stack gap="sm">
    <Inline gap="sm" align="center" justify="between">
      <Text as="span" size="sm" weight="medium">来源</Text>
      <SegmentedControl
        v-if="definition.work_content && adding"
        :model-value="values.method"
        :options="METHODS"
        size="sm"
        aria-label="来源的类型"
        @update:model-value="method"
      />
    </Inline>
    <Stack v-for="(citation, index) in existing" :key="index" gap="sm">
      <Input
        v-if="citation.url"
        variant="secondary"
        :model-value="citation.url"
        readonly
        aria-label="来源"
      >
        <template #leading><LinkIcon /></template>
      </Input>
      <CreatorEntryFormSourceCard
        :name="citation.source"
        :accessed="citation.accessed_at"
        :excerpt="citation.excerpt"
      />
    </Stack>
    <template v-if="adding">
      <CreatorEntryFormScreenshots
        v-if="values.method === 'screenshot'"
        v-model:values="values"
        v-model:shots="shots"
        :uploading="uploading"
        :work-content="definition.work_content"
        @upload="files => $emit('upload', files)"
      />
      <template v-else>
        <FormField name="source">
          <Input
            v-model="values.source"
            variant="secondary"
            placeholder="粘贴网址、ISBN 或 JAN"
            aria-label="来源"
            @change="$emit('read')"
            @paste="$nextTick(() => $emit('read'))"
          >
            <template #leading><LinkIcon /></template>
          </Input>
        </FormField>
        <Text
          v-if="reading"
          as="span"
          size="xs"
          tone="muted"
          class="inline-flex items-center gap-2"
        >
          <Spinner size="sm" />
          正在读取来源
        </Text>
        <CreatorEntryFormSourceCard
          v-else-if="source || page"
          :name="source?.title ?? null"
          :title="source?.url ?? source?.key ?? null"
        >
          <FormField v-if="page" name="excerpt" label="摘录">
            <Textarea
              v-model="values.excerpt"
              variant="secondary"
              :rows="2"
              placeholder="复制页面上包含该值的文字"
            />
          </FormField>
        </CreatorEntryFormSourceCard>
      </template>
      <Text
        v-if="definition.package_image && !definition.work_content"
        as="p"
        size="sm"
        tone="muted"
      >
        <template v-if="values.method === 'screenshot'">
          有网址时，<Link as="button" type="button" tone="accent" @click="method('link')"
            >改为粘贴网址</Link
          >。
        </template>
        <template v-else>
          没有网址时，可以<Link
            as="button"
            type="button"
            tone="accent"
            @click="method('screenshot')"
            >上传包装照片</Link
          >。
        </template>
      </Text>
    </template>
    <Button
      v-else
      variant="ghost"
      tone="neutral"
      size="sm"
      class="self-start"
      @click="adding = true"
    >
      <template #icon><Plus /></template>
      添加来源
    </Button>
  </Stack>
</template>
