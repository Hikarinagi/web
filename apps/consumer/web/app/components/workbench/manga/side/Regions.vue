<script setup lang="ts">
  import { Card, Empty, Inline, Ripple, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { Circle, Lock } from '@lucide/vue'
  import type { components } from '@hikarinagi/api-contract/v3'
  import { useMangaEditor } from '~/features/workbench/manga/composables/editor-context'
  import type { EditableRegion } from '~/features/workbench/manga/composables/useMangaRegions'
  import { cn } from '~/utils/cn'
  import { displayName } from '~/utils/user'

  const props = defineProps<{
    regions: EditableRegion[]
    mode: 'translate' | 'proofread' | 'typeset'
    lang?: string
    editing: Map<string, components['schemas']['UserRefDto'][]>
  }>()

  const auth = useAuthStore()
  const { store, translations } = useMangaEditor()
  const selectedId = store.selectedId
  const list = useTemplateRef<{ viewport: HTMLElement | undefined }>('list')
  watch(selectedId, async id => {
    if (!id) return
    await nextTick()
    list.value?.viewport
      ?.querySelector(`[data-region-row="${id}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })

  const options = computed(() =>
    props.regions.map((region, index) => {
      const chosen = region.translations.find(row => row.selected)
      return {
        value: region.id,
        label: region.source_text || '（空）',
        index: index + 1,
        target:
          props.mode === 'translate'
            ? translations.textOf(region)
            : chosen
              ? (chosen.proofread_text ?? chosen.text)
              : '',
        dot:
          translations.states.get(region.id) === 'error' || region.state === 10
            ? 'fill-danger text-danger'
            : chosen?.machine
              ? 'fill-warning text-warning'
              : region.state >= 20
                ? 'fill-success text-success'
                : 'text-faint',
        locked:
          !!region.locked_by &&
          region.locked_by !== auth.user?.id &&
          new Date(region.lock_expires_at ?? 0).getTime() > Date.now(),
        editors: props.editing.get(region.id) ?? [],
      }
    }),
  )
</script>

<template>
  <ScrollArea v-if="options.length" ref="list" class="h-full">
    <Stack gap="xs" class="p-2" aria-label="文本框">
      <Card
        v-for="option in options"
        :key="option.value"
        as="button"
        type="button"
        :padded="false"
        :data-region-row="option.value"
        :aria-pressed="option.value === selectedId"
        :class="
          cn(
            'hn-state-layer relative w-full hn-interactive px-3 py-2 text-start',
            option.value === selectedId && 'bg-accent-soft ring-2 ring-accent',
          )
        "
        @click="selectedId = option.value"
      >
        <Ripple />
        <Inline gap="sm" align="start" :wrap="false" class="min-w-0">
          <Inline gap="xs" align="center" :wrap="false" class="h-5 w-8 shrink-0">
            <Circle :class="cn('size-2 shrink-0', option.dot)" aria-hidden="true" />
            <Text as="span" size="xs" tone="muted" class="tabular-nums">
              {{ option.index }}
            </Text>
          </Inline>
          <Stack gap="none" class="min-w-0 flex-1">
            <Text as="span" size="sm" tone="muted" :lang="lang" truncate>
              {{ option.label }}
            </Text>
            <Text v-if="option.target" as="span" size="sm" truncate>{{ option.target }}</Text>
            <Text v-else as="span" size="sm" tone="faint">尚未翻译</Text>
          </Stack>
          <AvatarStack
            v-if="option.editors.length"
            v-tooltip="`${option.editors.map(user => displayName(user)).join('、')}正在编辑`"
            :users="option.editors"
            :max="2"
            size="sm"
          />
          <Lock
            v-else-if="option.locked"
            class="mt-0.5 size-3.5 shrink-0 text-warning-text"
            aria-label="正在被其他成员编辑"
          />
        </Inline>
      </Card>
    </Stack>
  </ScrollArea>
  <Empty
    v-else
    title="还没有文本框"
    description="在图片上的文本周围绘制一个框，或使用「自动处理」自动标记文本。"
    class="h-full"
  />
</template>
