<script setup lang="ts">
  import { Button, Grid, Heading, Inline, List, ListItem, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { castFacts, castGroups } from '~/features/wiki/editor/cast'
  import type { ReviewRow } from '~/features/wiki/editor/review'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiSaveCastOrder' })

  const props = defineProps<{ rows: ReviewRow[]; game: boolean }>()
  const editor = inject(ENTRY_EDITOR)!

  const nameOf = (id: number) =>
    editor
      .property(id, 'LABEL')
      .values.find(item => item.state !== 'removed' && item.state !== 'moved_out')?.value.text ??
    '未命名'
  const changed = computed(() => {
    const facts = editor.members.value
      .filter(
        member => member.type === 'APPEARANCE' && !editor.draft.value.detached.includes(member.id),
      )
      .map(member => castFacts(editor, member.id))
    const before = castGroups(facts, props.game, 'before')
    return castGroups(facts, props.game).flatMap(group => {
      const old = before.find(item => item.key === group.key)?.ids ?? []
      const same = old.length === group.ids.length && old.every((id, at) => group.ids[at] === id)
      return same ? [] : [{ ...group, old }]
    })
  })

  function revert() {
    for (const row of props.rows) editor.revert(row.id)
  }
</script>

<template>
  <Stack gap="sm">
    <Inline gap="sm" align="baseline" justify="between">
      <Heading :level="3" size="xs">出场角色的顺序</Heading>
      <Button size="xs" variant="ghost" tone="neutral" @click="revert">撤回</Button>
    </Inline>
    <Stack gap="md" class="rounded-md border border-line px-4 py-3">
      <Stack v-for="group in changed" :key="group.key" gap="xs">
        <Text size="xs" weight="medium" tone="muted">{{ group.title }}</Text>
        <Grid :cols="2" gap="md">
          <Stack v-for="(ids, side) in [group.old, group.ids]" :key="side" gap="xs">
            <Text size="xs" tone="faint">{{ side ? '调整后' : '调整前' }}</Text>
            <List ordered class="text-sm">
              <ListItem
                v-for="(id, at) in ids"
                :key="id"
                lang="ja"
                :class="cn(side === 1 && group.old[at] !== id && 'text-accent-text')"
              >
                {{ nameOf(id) }}
              </ListItem>
            </List>
          </Stack>
        </Grid>
      </Stack>
    </Stack>
  </Stack>
</template>
