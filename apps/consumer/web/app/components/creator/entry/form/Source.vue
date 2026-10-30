<script setup lang="ts">
  import {
    FormField,
    Inline,
    Input,
    SegmentedControl,
    Spinner,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import { Link2 } from '@lucide/vue'
  import type { MediaValue } from '~/components/media-library/types'
  import type { BackendPropertyDefinition, BackendSource } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'

  defineOptions({ name: 'CreatorEntryFormSource' })
  const props = defineProps<{
    source: BackendSource | null
    reading: boolean
    definition: BackendPropertyDefinition
    uploading: boolean
  }>()
  const values = defineModel<StatementValues>('values', { required: true })
  const shots = defineModel<{ media: MediaValue; name: string }[]>('shots', { required: true })
  defineEmits<{ read: []; upload: [files: File[]] }>()

  const page = computed(
    () => !props.source?.record_key && /^https?:\/\//i.test(values.value.source.trim()),
  )
  const methods = computed(() =>
    props.definition.work_content || props.definition.package_image
      ? [
          { value: 'link', label: '网址或编号' },
          {
            value: 'screenshot',
            label: props.definition.work_content ? '作品截图' : '包装照片',
          },
        ]
      : null,
  )
</script>

<template>
  <Stack gap="sm">
    <Inline gap="sm" align="center" justify="between">
      <Text as="span" size="sm" weight="medium">来源</Text>
      <SegmentedControl
        v-if="methods"
        :model-value="values.method"
        :options="methods"
        size="sm"
        aria-label="来源"
        @update:model-value="
          value => (values.method = value === 'screenshot' ? 'screenshot' : 'link')
        "
      />
    </Inline>
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
          placeholder="粘贴网址、ISBN 或 JAN"
          aria-label="来源"
          @change="$emit('read')"
          @paste="$nextTick(() => $emit('read'))"
        >
          <template #leading><Link2 /></template>
        </Input>
      </FormField>
      <Text v-if="reading" as="span" size="xs" tone="muted" class="inline-flex items-center gap-2">
        <Spinner size="sm" />
        正在读取来源
      </Text>
      <Stack v-else-if="source || page" gap="sm" class="rounded-md bg-subtle p-3">
        <Stack v-if="source" gap="none">
          <Text v-if="source.title" as="span" size="sm" weight="medium">{{ source.title }}</Text>
          <Text as="span" :size="source.title ? 'xs' : 'sm'" tone="muted" class="break-all">
            {{ source.url ?? source.key }}
          </Text>
        </Stack>
        <FormField v-if="page" name="excerpt" label="摘录">
          <Textarea v-model="values.excerpt" :rows="2" placeholder="复制页面上包含该值的文字" />
        </FormField>
      </Stack>
    </template>
  </Stack>
</template>
