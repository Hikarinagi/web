<script setup lang="ts">
  import { Button, Dialog, FileUpload, toast } from '@hina-ui/vue'
  import type { BackendMangaPage } from '~/features/workbench/manga/manga'

  const props = defineProps<{ page: BackendMangaPage; kind: 'cleaned' | 'rendered' | null }>()
  const emit = defineEmits<{ close: []; changed: [] }>()

  const file = ref<File | null>(null)
  const busy = ref(false)
  const visible = computed({
    get: () => props.kind !== null,
    set: value => {
      if (!value) emit('close')
    },
  })
  const title = computed(() => (props.kind === 'cleaned' ? '清理图' : '成品'))
  const current = computed(() =>
    props.kind === 'cleaned' ? props.page.cleaned_url : props.page.rendered_url,
  )

  watch(visible, next => {
    if (next) file.value = null
  })

  async function save(clear: boolean) {
    if (!props.kind || busy.value || (!clear && !file.value)) return
    busy.value = true
    try {
      const path = { page_id: props.page.id, kind: props.kind }
      if (clear) {
        await hikariRequest('/api/v3/manga-project-pages/{page_id}/images/{kind}', {
          method: 'delete',
          path,
        })
      } else {
        const body = new FormData()
        body.append('file', file.value as File)
        await hikariRequest('/api/v3/manga-project-pages/{page_id}/images/{kind}', {
          method: 'put',
          path,
          body,
        })
      }
      toast.success(clear ? `已移除${title.value}` : `已上传${title.value}`)
      emit('changed')
      emit('close')
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" :title="`上传${title}`" size="sm" :locked="busy">
    <template #content>
      <FileUpload v-model="file" accept="image/*" :aria-label="`选择${title}`" />
    </template>

    <template #footer>
      <Button
        v-if="current"
        variant="ghost"
        tone="danger"
        :disabled="busy"
        class="me-auto"
        @click="save(true)"
      >
        移除现有{{ title }}
      </Button>
      <Button variant="ghost" tone="neutral" :disabled="busy" @click="visible = false">取消</Button>
      <Button :loading="busy" :disabled="!file" @click="save(false)">上传</Button>
    </template>
  </Dialog>
</template>
