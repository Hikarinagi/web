<script setup lang="ts">
  import {
    Alert,
    Button,
    Dialog,
    FormField,
    Inline,
    Input,
    SegmentedControl,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { MangaTarget, MangaTargetVolume } from '~/features/contribute/manga-target'
  import { useVolumeCreate } from '~/features/contribute/useVolumeCreate'
  import { getMangaVolumeLabel } from '~/utils/media/manga'

  const props = defineProps<{
    series: MangaTarget
    volumeNumber: number | null
    volumes: MangaTargetVolume[]
  }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ created: [volume: { id: number; label: string }] }>()

  const METHODS = [
    { value: 'isbn', label: '通过 ISBN 新建' },
    { value: 'manual', label: '手动填写' },
  ]
  const { confirm } = useHikariConfirm()
  const flow = useVolumeCreate(() => props.series)
  const { method, isbn, number, title, draft, notice, loading, saving } = flow
  const values = computed(() => {
    const found = (property: string) =>
      draft.value?.operations.find(
        operation =>
          operation.op === 'add' && operation.entry_ref === 'v' && operation.property === property,
      )?.value?.text
    return { number: found('VOLUME_NUMBER') ?? null, title: found('TITLE') ?? null }
  })
  const shown = computed(() =>
    method.value === 'isbn' ? values.value : { number: number.value, title: title.value },
  )
  const taken = computed(() => {
    const value = shown.value.number?.trim()
    return value && props.volumes.some(volume => String(volume.volume_number) === value)
      ? value
      : null
  })
  const ready = computed(
    () =>
      !taken.value &&
      (method.value === 'isbn'
        ? Boolean(draft.value?.operations.length)
        : Boolean(title.value.trim())),
  )

  watch(open, next => {
    if (!next) return
    flow.reset()
    number.value = props.volumeNumber === null ? '' : String(props.volumeNumber)
  })

  async function create() {
    const label = getMangaVolumeLabel({
      volume_number: shown.value.number ? Number(shown.value.number) || null : null,
      name: shown.value.title,
      name_cn: null,
    })
    const id = await flow.create()
    if (id === null) return
    emit('created', { id, label })
    open.value = false
  }

  function submit() {
    confirm({
      title: '确认新建这一卷',
      description: `维基已收录这部作品的 ${props.volumes.length} 卷。只收一卷中一部分的电子版分册不另建卷，应选择其内容所在的卷，并填写是第几部分。`,
      confirmText: '新建',
      cancelText: '返回',
      onConfirm: create,
    })
  }
</script>

<template>
  <Dialog v-model:open="open" title="新建单行本条目" size="md" :locked="saving || loading">
    <template #content>
      <Stack gap="md">
        <Inline gap="sm" align="center" justify="between">
          <Text size="sm" tone="muted">{{ series.title }}</Text>
          <SegmentedControl
            :model-value="method"
            :options="METHODS"
            size="sm"
            @update:model-value="value => (method = value === 'manual' ? 'manual' : 'isbn')"
          />
        </Inline>
        <template v-if="method === 'isbn'">
          <Inline gap="sm" :wrap="false">
            <Input
              v-model="isbn"
              placeholder="ISBN"
              class="min-w-0 flex-1"
              @keydown.enter="flow.read()"
            />
            <Button :loading="loading" :disabled="!isbn.trim()" @click="flow.read()">查找</Button>
          </Inline>
          <Alert :open="Boolean(notice)" tone="warning" :title="notice ?? undefined" />
          <Stack v-if="draft" gap="xs" class="rounded-md bg-subtle p-3">
            <Text as="span" size="sm" weight="medium" lang="ja">{{ values.title }}</Text>
            <Text v-if="values.number" as="span" size="xs" tone="muted">
              卷次：{{ values.number }}
            </Text>
          </Stack>
        </template>
        <template v-else>
          <FormField name="number" label="卷次">
            <Input v-model="number" lang="ja" class="max-w-40" />
          </FormField>
          <FormField name="title" label="书名" required>
            <Input v-model="title" lang="ja" />
          </FormField>
        </template>
        <Alert
          :open="Boolean(taken)"
          tone="warning"
          :title="`维基已收录第 ${taken} 卷，请从列表中选择。`"
        />
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="saving" @click="open = false">
        取消
      </Button>
      <Button :loading="saving" :disabled="!ready" @click="submit()">创建并选中</Button>
    </template>
  </Dialog>
</template>
