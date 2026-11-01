<script setup lang="ts">
  import {
    Alert,
    Button,
    Card,
    Inline,
    Input,
    SegmentedControl,
    SimpleGrid,
    Spinner,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { Link as LinkIcon } from '@lucide/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { useImageAdd } from '~/features/creator/entry/useImageAdd'

  defineOptions({ name: 'CreatorEntryImagesAdd' })
  const props = defineProps<{
    entry: { id: number; revision: number; type: string }
    definition: BackendPropertyDefinition
    current: BackendStatement | null
    existing: string[]
  }>()
  const emit = defineEmits<{ cancel: []; saved: [] }>()

  const add = useImageAdd({
    entry: props.entry,
    definition: props.definition,
    current: props.current,
  })
  const { method, url, source, reading, selected, uploads, proofs, uploading, saving } = add
  const METHODS = [
    { value: 'link', label: '网址' },
    { value: 'upload', label: '上传图片' },
  ]
  const images = computed(() => source.value?.images ?? [])
  const fresh = computed(() => images.value.filter(image => !props.existing.includes(image.url)))
  const ready = computed(() =>
    method.value === 'link' ? selected.value.length > 0 : uploads.value.length > 0,
  )

  async function save() {
    if (await add.save()) emit('saved')
  }
</script>

<template>
  <Card :padded="false" class="border-line-strong p-4 shadow-none">
    <Stack gap="md">
      <Inline gap="sm" align="center" justify="between">
        <Text as="span" size="sm" weight="medium">来源</Text>
        <SegmentedControl
          :model-value="method"
          :options="METHODS"
          size="sm"
          aria-label="来源"
          @update:model-value="value => (method = value === 'upload' ? 'upload' : 'link')"
        />
      </Inline>
      <template v-if="method === 'link'">
        <Input
          v-model="url"
          variant="secondary"
          placeholder="粘贴网址、ISBN 或 JAN"
          aria-label="来源"
          @change="add.read()"
          @paste="$nextTick(() => add.read())"
        >
          <template #leading><LinkIcon /></template>
        </Input>
        <Spinner v-if="reading" size="sm" />
        <Stack v-else-if="source" gap="sm" class="rounded-md bg-subtle p-3">
          <Text v-if="source.title" as="span" size="sm" weight="medium">{{ source.title }}</Text>
          <Text as="span" size="xs" tone="muted">页面中的图片</Text>
          <SimpleGrid min="8rem" gap="sm">
            <Card
              v-for="image in images"
              :key="image.url"
              as="button"
              type="button"
              :padded="false"
              :disabled="existing.includes(image.url)"
              :aria-pressed="selected.includes(image.url)"
              class="hn-state-layer relative hn-interactive overflow-hidden hn-press-lg"
              :class="
                existing.includes(image.url)
                  ? 'opacity-50'
                  : selected.includes(image.url)
                    ? 'ring-2 ring-accent'
                    : undefined
              "
              @click="add.toggle(image.url)"
            >
              <HikariImage
                :src="image.url"
                :alt="image.alt"
                class="aspect-video w-full"
                image-class="size-full object-cover"
              />
              <Tag
                v-if="existing.includes(image.url)"
                tone="neutral"
                class="absolute bottom-1 left-1"
              >
                {{ current?.media?.src === image.url ? '当前封面' : '已添加' }}
              </Tag>
            </Card>
          </SimpleGrid>
        </Stack>
        <Alert
          :open="Boolean(source && images.length && !fresh.length)"
          tone="info"
          :title="`页面中的 ${images.length} 张图片都已添加`"
        />
      </template>
      <CreatorEntryImagesUpload
        v-else
        v-model:proofs="proofs"
        :uploads="uploads"
        :uploading="uploading"
        :single="add.single"
        :proof="entry.type === 'PRODUCT' && definition.property === 'COVER'"
        @upload="(files, proof) => add.upload(files, proof)"
      />
      <Inline gap="sm" justify="end" class="border-t border-line pt-4">
        <Button variant="ghost" tone="neutral" size="sm" :disabled="saving" @click="emit('cancel')">
          取消
        </Button>
        <Button size="sm" :loading="saving" :disabled="!ready" @click="save()">保存</Button>
      </Inline>
    </Stack>
  </Card>
</template>
