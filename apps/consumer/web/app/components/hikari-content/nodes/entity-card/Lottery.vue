<script setup lang="ts">
  import { Card, Text } from '@hina-ui/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { ENTITY_CARD_IN_EDITOR_KEY } from './context'

  defineOptions({ name: 'HikariContentNodesEntityCardLottery' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()
  const inEditor = inject(ENTITY_CARD_IN_EDITOR_KEY, false)
  const { t } = useLocaleText()

  const summary = computed(() => {
    const id = props.node.attrs?.lottery_id
    return typeof id === 'number' && id > 0 ? (summaries.value.lotteries.get(id) ?? null) : null
  })
</script>

<template>
  <LotteryCard v-if="summary" :initial="summary" :class="inEditor ? '' : 'my-hikari-node'" />
  <Card v-else :padded="false" class="rounded-xl p-4" :class="inEditor ? '' : 'my-hikari-node'">
    <Text as="span" size="sm" tone="muted">{{ t('lottery.missing') }}</Text>
  </Card>
</template>
