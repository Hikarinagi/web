<script setup lang="ts">
  import {
    Button,
    FileUpload,
    FormField,
    Grid,
    IconButton,
    Inline,
    Input,
    Select,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { Upload, X } from '@lucide/vue'
  import type { MediaValue } from '~/components/media-library/types'
  import { ENTRY_VERSIONS } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'

  defineOptions({ name: 'CreatorEntryFormScreenshots' })
  defineProps<{ uploading: boolean; workContent: boolean }>()
  const values = defineModel<StatementValues>('values', { required: true })
  const shots = defineModel<{ media: MediaValue; name: string }[]>('shots', { required: true })
  const emit = defineEmits<{ upload: [files: File[]] }>()

  const versions = inject(
    ENTRY_VERSIONS,
    computed(() => []),
  )
  const options = computed(() =>
    versions.value.map(item => ({ value: item.id, label: item.label })),
  )

  function picked(value: File | File[] | null) {
    const files = Array.isArray(value) ? value : value ? [value] : []
    if (files.length) emit('upload', files)
  }
  function lead(index: number) {
    const next = [...shots.value]
    const [shot] = next.splice(index, 1)
    if (shot) shots.value = [shot, ...next]
  }
</script>

<template>
  <Stack gap="sm">
    <Inline
      v-for="(shot, index) in shots"
      :key="shot.media.id"
      gap="md"
      align="center"
      :wrap="false"
      class="rounded-md border border-line px-3 py-2"
    >
      <HikariImage
        :src="shot.media"
        alt=""
        preset="small"
        class="h-9 w-16 shrink-0 overflow-hidden rounded-sm"
        image-class="size-full object-cover"
      />
      <Text as="span" size="sm" truncate class="min-w-0 flex-1">{{ shot.name }}</Text>
      <template v-if="workContent">
        <Tag v-if="index === 0" tone="neutral">标题画面</Tag>
        <Button v-else variant="ghost" tone="neutral" size="sm" @click="lead(index)">
          设为标题画面
        </Button>
      </template>
      <IconButton
        :label="`移除 ${shot.name}`"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="shots = shots.filter(item => item.media.id !== shot.media.id)"
      >
        <X />
      </IconButton>
    </Inline>
    <FileUpload
      :model-value="null"
      multiple
      :list="false"
      :loading="uploading"
      accept="image/jpeg,image/png,image/webp,image/gif"
      @update:model-value="picked"
    >
      <template #icon><Upload /></template>
      拖拽文件到此处，或点击选择
    </FileUpload>
    <Grid v-if="workContent" :cols="2" gap="md">
      <FormField name="version" label="版本">
        <Select
          v-model="values.version"
          variant="secondary"
          :options="options"
          placeholder="请选择"
        />
      </FormField>
      <FormField name="location">
        <template #label>
          作品中的位置
          <Question title="作品中的位置" aria-label="查看作品中的位置的说明">
            填写截图在作品中的位置，照作品自己的章节、路线或时期名称，例如路线名。
          </Question>
        </template>
        <Input
          v-model="values.location"
          variant="secondary"
          placeholder="章节或路线名称"
          lang="ja"
        />
      </FormField>
    </Grid>
  </Stack>
</template>
