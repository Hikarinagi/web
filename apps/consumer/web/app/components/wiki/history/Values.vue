<script setup lang="ts">
  import { Empty, Inline, Panel, Stack, Text } from '@hina-ui/vue'
  import type { RevisionComparison } from '~/features/wiki/changes'
  import { qualifierText, valueText, type ComparedStatement } from '~/features/wiki/values'

  defineOptions({ name: 'WikiHistoryValues' })

  const props = defineProps<{ content: RevisionComparison; names: Record<string, string> }>()

  const groups = computed(() =>
    props.content.properties
      .map(group => ({
        property: group.property,
        values: group.statements.flatMap(item =>
          item.after && item.after.status !== 'DEPRECATED' ? [item.after] : [],
        ),
      }))
      .filter(group => group.values.length),
  )
  const describe = (value: ComparedStatement) => {
    const qualifier = qualifierText(value)
    const text = valueText(value) || '空'
    return qualifier ? `${text}（${qualifier}）` : text
  }
</script>

<template>
  <Panel title="这个版本的内容" :padded="false">
    <Empty v-if="!groups.length" title="没有内容" />
    <Stack v-else gap="none" align="stretch" class="divide-y divide-line">
      <Inline
        v-for="group in groups"
        :key="group.property"
        gap="md"
        align="start"
        :wrap="false"
        class="px-(--hn-panel-p) py-3"
      >
        <Text size="sm" tone="muted" class="w-28 shrink-0">
          {{ names[group.property] ?? group.property }}
        </Text>
        <Stack gap="xs" class="min-w-0 flex-1">
          <template v-for="value in group.values" :key="value.id">
            <HikariImage
              v-if="value.media"
              :src="value.media"
              alt=""
              preset="small"
              preview
              class="size-20 overflow-hidden rounded-md"
              image-class="size-full object-cover"
            />
            <Text v-else size="sm" lang="ja" class="whitespace-pre-wrap">{{
              describe(value)
            }}</Text>
          </template>
        </Stack>
      </Inline>
    </Stack>
  </Panel>
</template>
