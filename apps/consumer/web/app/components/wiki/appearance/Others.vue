<script setup lang="ts">
  import { Button, Empty, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiAppearanceOthers' })

  const props = defineProps<{ appearance: number }>()
  const editor = inject(ENTRY_EDITOR)!
  const relation = computed(() =>
    editor.definitions.value
      .get('APPEARANCE')
      ?.properties.find(item => item.property === 'APPEARANCE_RELATION'),
  )
  const others = computed(() =>
    [...editor.entries.value.values()]
      .filter(entry => entry.type === 'APPEARANCE' && entry.id !== props.appearance)
      .map(entry => {
        const live = (property: 'LABEL' | 'WORK') =>
          entry.statements.find(item => item.property === property && item.status !== 'DEPRECATED')
        return {
          id: entry.id,
          name: live('LABEL')?.text || entry.label,
          work: live('WORK')?.target ?? null,
          detached: editor.draft.value.detached.includes(entry.id),
        }
      }),
  )
</script>

<template>
  <Panel title="其他作品中的出场" :count="others.length">
    <Stack gap="lg">
      <Empty v-if="!others.length && !relation" title="没有其他作品中的出场" />
      <Stack v-if="others.length" gap="sm">
        <Inline
          v-for="other in others"
          :key="other.id"
          gap="sm"
          align="center"
          justify="between"
          :wrap="false"
          :class="
            cn(
              'rounded-sm border-l-2 py-1 pl-3',
              other.detached ? 'border-accent' : 'border-transparent',
            )
          "
        >
          <Stack gap="none" class="min-w-0">
            <Link
              :as="NuxtLink"
              :to="`/entries/${other.id}/edit`"
              lang="ja"
              :class="cn('truncate text-sm', other.detached && 'line-through')"
            >
              {{ other.name }}
            </Link>
            <Text v-if="other.work" size="xs" tone="muted" lang="ja" truncate>
              {{ other.work.label }}
            </Text>
          </Stack>
          <Button
            variant="ghost"
            tone="neutral"
            size="sm"
            class="shrink-0"
            @click="editor.detach(other.id, !other.detached)"
          >
            {{ other.detached ? '撤回' : '移出' }}
          </Button>
        </Inline>
      </Stack>
      <WikiFieldProperty v-if="relation" :entry="appearance" :definition="relation" />
    </Stack>
  </Panel>
</template>
