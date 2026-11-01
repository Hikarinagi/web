<script setup lang="ts">
  import { Button, Card, Dialog, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { X } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import type { BackendEditorSchema } from '~/features/creator/editor'
  import { getMangaVolumeLabel } from '~/utils/media/manga'
  import VolumeCreateForm from './VolumeCreateForm.vue'

  type SearchItem = ApiData<'/api/v3/external-source/{source}/search', 'get'>[number]

  const props = defineProps<{ series: MangaTarget; volumeNumber: number | null }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{
    created: [volume: { id: number; label: string; change_request_id: number; pending: boolean }]
    picked: [volumeId: number]
  }>()

  const form = useTemplateRef<InstanceType<typeof VolumeCreateForm>>('form')
  const schema = shallowRef<BackendEditorSchema | null>(null)
  const picked = ref<SearchItem | null>(null)
  const prefill = shallowRef<Record<string, unknown> | null>(null)
  const loading = ref(false)
  const submitting = computed(() => form.value?.submitting ?? false)

  watch(open, async next => {
    if (!next) return
    picked.value = null
    prefill.value = null
    if (!schema.value) {
      loading.value = true
      try {
        schema.value = await hikariRequest('/api/v3/contribution/schemas/{resource_type}', {
          path: { resource_type: 'manga-volume' },
        })
      } finally {
        loading.value = false
      }
    }
  })

  watch(picked, async item => {
    if (!item) return
    if (item.existing_id != null) {
      emit('picked', item.existing_id)
      open.value = false
      return
    }
    loading.value = true
    try {
      const draft = await hikariRequest('/api/v3/external-source/manga-volume-draft', {
        query: { bangumi_id: item.external_id },
      })
      const media = draft.cover
        ? await hikariRequest('/api/v3/external-source/cover-media', {
            method: 'post',
            body: { url: draft.cover },
            toast: false,
          }).catch(() => null)
        : null
      prefill.value = {
        ...draft.draft,
        series_id: props.series.id,
        volume_number: draft.draft.volume_number ?? props.volumeNumber,
        ...(media
          ? {
              covers: [
                {
                  target_id: media.id,
                  target: { name: '', cover: media.src },
                  attributes: { sexual: 0, violence: 0 },
                },
              ],
            }
          : {}),
      }
    } finally {
      loading.value = false
    }
  })

  function manual() {
    picked.value = null
    prefill.value = { series_id: props.series.id, volume_number: props.volumeNumber }
  }

  function restart() {
    picked.value = null
    prefill.value = null
  }

  function onSubmitted(result: BackendChangeRequestDetail) {
    if (result.resource_id == null) return
    const values = prefill.value ?? {}
    emit('created', {
      id: result.resource_id,
      label: getMangaVolumeLabel({
        volume_number: typeof values.volume_number === 'number' ? values.volume_number : null,
        name: typeof values.name === 'string' ? values.name : null,
        name_cn: typeof values.name_cn === 'string' ? values.name_cn : null,
      }),
      change_request_id: result.id,
      pending: result.status === 'PENDING',
    })
    open.value = false
  }
</script>

<template>
  <Dialog v-model:open="open" title="新建单行本条目" size="md" :locked="submitting || loading">
    <template #content>
      <Stack gap="md" class="relative">
        <Text size="sm" tone="muted">{{ series.title }}</Text>
        <template v-if="!prefill">
          <CreatorEditorImportSourceSearch
            v-model="picked"
            source="bangumi"
            label="从 Bangumi 查找"
            type="manga-volume"
            allow-existing
            placeholder="ISBN、书名或 Bangumi 条目号"
          />
          <Button variant="link" size="sm" class="self-start" @click="manual">手动填写</Button>
        </template>
        <template v-else>
          <Card v-if="picked" :padded="false">
            <Inline gap="sm" align="center" :wrap="false" class="p-2">
              <HikariImage
                :src="picked.cover ?? ''"
                alt=""
                preset="small"
                class="h-14 w-10 shrink-0 rounded bg-subtle"
                image-class="size-full object-cover"
              >
                <template #empty />
                <template #error />
              </HikariImage>
              <Stack gap="none" class="min-w-0 flex-1">
                <Text as="span" size="sm" weight="medium" truncate class="min-w-0">
                  {{ picked.title }}
                </Text>
                <Text as="span" size="xs" tone="muted">Bangumi {{ picked.external_id }}</Text>
              </Stack>
              <IconButton label="换一个" variant="ghost" tone="neutral" size="sm" @click="restart">
                <X />
              </IconButton>
            </Inline>
          </Card>
          <VolumeCreateForm
            v-if="schema"
            ref="form"
            :key="picked?.external_id ?? 'manual'"
            :schema="schema"
            :prefill="prefill"
            @submitted="onSubmitted"
          />
        </template>
        <LoadingOverlay :visible="loading" size="sm" />
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button v-if="prefill" :loading="submitting" @click="form?.submit()">创建并选中</Button>
    </template>
  </Dialog>
</template>
