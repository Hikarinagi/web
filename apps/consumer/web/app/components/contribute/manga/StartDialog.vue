<script setup lang="ts">
  import { Button, Dialog, Stack, Text } from '@hina-ui/vue'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import StartForm from './StartForm.vue'

  defineProps<{
    series: MangaTarget
    chapter: { id: number; label: string } | null
  }>()
  const open = defineModel<boolean>('open', { required: true })

  const form = useTemplateRef<InstanceType<typeof StartForm>>('form')
  const submitting = computed(() => form.value?.submitting ?? false)
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="chapter?.label ?? series.title"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Stack gap="lg">
        <Text v-if="chapter" weight="medium">{{ series.title }}</Text>
        <StartForm
          ref="form"
          :key="`${series.id}-${chapter?.id ?? 'new'}`"
          :series="series"
          :chapter-id="chapter?.id ?? null"
          lock-series
        />
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">开始</Button>
    </template>
  </Dialog>
</template>
