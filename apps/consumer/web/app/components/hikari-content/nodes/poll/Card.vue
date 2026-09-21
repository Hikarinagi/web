<script setup lang="ts">
  import { Card, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { Pencil } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import type { PollCardSummary } from '../../composables/useContentSummaries'
  import { usePollCard } from '~/features/interaction/usePollCard'

  defineOptions({ name: 'HikariContentNodesPollCard' })

  const props = withDefaults(
    defineProps<{ node?: EditorNode; poll?: PollCardSummary | null; interactive?: boolean }>(),
    { node: undefined, poll: null, interactive: true },
  )

  const {
    canEdit,
    openEdit,
    question,
    rows,
    resultsVisible,
    canVote,
    pick,
    voters,
    footerText,
    hasContent,
  } = usePollCard(props)
</script>

<template>
  <Card
    v-if="hasContent"
    :padded="false"
    class="relative rounded-xl p-3"
    :class="interactive ? 'my-hikari-node' : ''"
  >
    <Stack v-if="canEdit" gap="none" class="absolute top-4 right-4 z-10">
      <IconButton login-required label="编辑投票" size="sm" @click="openEdit">
        <Pencil />
      </IconButton>
    </Stack>

    <Text as="p" size="sm" weight="semibold" class="mt-0! mb-2!" :class="canEdit ? 'pr-8' : ''">
      <Tag tone="neutral" size="md" class="mr-2">投票</Tag>
      {{ question }}
    </Text>

    <Stack gap="sm">
      <HikariContentNodesPollOption
        v-for="row in rows"
        :key="row.key"
        :label="row.label"
        :percent="row.percent"
        :selected="row.selected"
        :results-visible="resultsVisible"
        :disabled="row.disabled"
        :login-required="canVote"
        @pick="pick(row.id)"
      />
    </Stack>

    <Inline gap="none" align="center" :wrap="false" class="mt-3 gap-1.5">
      <AvatarStack v-if="voters.length" :users="voters" size="sm" card />
      <Text as="span" size="xs" tone="muted">{{ footerText }}</Text>
    </Inline>
  </Card>

  <Card v-else :padded="false" class="my-hikari-node rounded-xl p-4">
    <Text as="span" size="sm" tone="muted">投票不可用</Text>
  </Card>
</template>
