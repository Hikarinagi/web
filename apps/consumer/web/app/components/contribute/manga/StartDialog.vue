<script setup lang="ts">
  import { Button, Dialog, Stack, Text } from '@hina-ui/vue'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import StartForm from './StartForm.vue'

  withDefaults(
    defineProps<{
      series: MangaTarget
      chapter?: { id: number; label: string } | null
      volume?: { id: number; label: string } | null
      scope?: 'CHAPTER' | 'VOLUME'
      newChapter?: string
    }>(),
    { chapter: null, volume: null, scope: undefined, newChapter: undefined },
  )
  const open = defineModel<boolean>('open', { required: true })

  const form = useTemplateRef<InstanceType<typeof StartForm>>('form')
  const submitting = computed(() => form.value?.submitting ?? false)
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="chapter?.label ?? volume?.label ?? series.title"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Stack gap="lg">
        <Text v-if="chapter || volume" weight="medium">{{ series.title }}</Text>
        <StartForm
          ref="form"
          :key="`${series.id}-${chapter?.id ?? 'chapter'}-${volume?.id ?? 'volume'}`"
          :series="series"
          :chapter-id="chapter?.id ?? null"
          :volume-id="volume?.id ?? null"
          :scope="scope"
          :new-chapter="newChapter"
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
