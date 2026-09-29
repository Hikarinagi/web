<script setup lang="ts">
  import { Button, Card, Dialog, IconButton, Inline, SegmentedControl, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { CircleHelp, History } from '@lucide/vue'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import { useContributeKind } from '~/features/contribute/useContributeKind'
  import { useDeskSize } from '~/features/contribute/useDeskSize'
  import { useNovelIntake } from '~/features/contribute/useNovelIntake'
  import MangaStartForm from '../manga/StartForm.vue'
  import NovelUpload from './Novel.vue'

  defineProps<{ dragging: boolean; manga: MangaTarget | null }>()
  const emit = defineEmits<{ selected: [value: boolean] }>()

  const PAPER = [
    'scheme-light max-h-(--contribute-queue-height) rounded-xs border-contribute-paper-edge bg-contribute-paper text-contribute-ink shadow-contribute-paper!',
    'transition-colors duration-(--hn-duration-base) ease-(--hn-ease-move) data-dragging:border-contribute-ink data-dragging:bg-contribute-paper-hover',
    '[--hn-surface:var(--color-contribute-paper)] [--hn-bg-subtle:var(--color-contribute-paper-subtle)] [--hn-bg-inset:var(--color-contribute-paper-inset)]',
    '[--hn-fg-default:var(--color-contribute-ink)] [--hn-fg-max:var(--color-contribute-ink)] [--hn-fg-muted:var(--color-contribute-ink-muted)]',
    '[--hn-fg-subtle:var(--color-contribute-ink-subtle)] [--hn-fg-disabled:var(--color-contribute-ink-disabled)]',
    '[--hn-border:var(--color-contribute-paper-edge)] [--hn-border-strong:var(--color-contribute-ink-border)]',
    '[--hn-neutral-solid:var(--color-contribute-ink)] [--hn-neutral-solid-on:var(--color-contribute-paper)]',
    '[--hn-accent:var(--color-contribute-ink)] [--hn-accent-on:var(--color-contribute-paper)] [--hn-accent-text:var(--color-contribute-ink)]',
    '[--hn-accent-soft:var(--color-contribute-paper-soft)] [--hn-accent-border:var(--color-contribute-ink-outline)] [--hn-focus-ring:var(--color-contribute-ink)]',
    '[--hn-shadow-sm:var(--shadow-contribute-paper-sm)] [--hn-shadow-md:var(--shadow-contribute-paper-md)] [--hn-shadow-lg:var(--shadow-contribute-paper-lg)]',
    '[--hn-scroll-shadow:var(--color-contribute-scroll-shadow)]',
    '[--hn-state-hover-opacity:var(--contribute-paper-hover-opacity)] [--hn-state-press-opacity:var(--contribute-paper-press-opacity)] [--hn-state-selected-opacity:var(--contribute-paper-selected-opacity)]',
  ]
  const KINDS = [
    { value: 'novel', label: '小说' },
    { value: 'manga', label: '漫画' },
  ]

  const kind = useContributeKind()
  const help = ref(false)
  const intake = useNovelIntake()
  const { large, control } = useDeskSize()
  const novel = useTemplateRef<InstanceType<typeof NovelUpload>>('novel')
  const form = useTemplateRef<InstanceType<typeof MangaStartForm>>('form')

  watchEffect(() => emit('selected', kind.value === 'novel' && intake.items.value.length > 0))

  async function receive(files: File[]) {
    kind.value = 'novel'
    const upload = await until(novel).toBeTruthy({ timeout: 2000 })
    upload?.receive(files)
  }

  defineExpose({ receive })
</script>

<template>
  <Card
    :class="cn(PAPER, large && '[--contribute-desk-width:var(--contribute-desk-width-large)]')"
    :data-dragging="dragging || undefined"
  >
    <Stack gap="sm">
      <Inline align="center" justify="between" gap="sm" :wrap="false">
        <SegmentedControl
          :model-value="kind"
          :options="KINDS"
          :size="control"
          aria-label="投稿类型"
          @update:model-value="value => (kind = value === 'manga' ? 'manga' : 'novel')"
        />
        <Inline align="center" gap="xs" :wrap="false">
          <IconButton
            :as="NuxtLink"
            to="/create/projects"
            label="我的投稿"
            :size="control"
            variant="ghost"
            tone="neutral"
          >
            <History />
          </IconButton>
          <IconButton
            label="投稿指南"
            :size="control"
            variant="ghost"
            tone="neutral"
            @click="help = true"
          >
            <CircleHelp />
          </IconButton>
        </Inline>
      </Inline>

      <NovelUpload v-if="kind === 'novel'" ref="novel" :intake="intake" :dragging="dragging" />
      <Stack v-else gap="md">
        <MangaStartForm ref="form" :series="manga" />
        <Button :loading="form?.submitting" :disabled="!form?.ready" @click="form?.submit()">
          开始
        </Button>
      </Stack>
    </Stack>
    <Dialog
      v-model:open="help"
      :title="kind === 'manga' ? '漫画投稿指南' : '小说投稿指南'"
      size="lg"
    >
      <template #content>
        <ContributeGuide :kind="kind" />
      </template>
    </Dialog>
  </Card>
</template>
