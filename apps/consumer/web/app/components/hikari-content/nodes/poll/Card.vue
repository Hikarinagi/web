<script setup lang="ts">
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
  <div
    v-if="hasContent"
    class="relative rounded-xl border border-surface bg-surface-0 p-3 dark:bg-surface-900"
    :class="interactive ? 'my-[0.8em]' : ''"
  >
    <div v-if="canEdit" class="absolute top-4 right-4 z-10">
      <Button
        v-tooltip.top="'编辑投票'"
        unstyled
        type="button"
        class="inline-flex size-7 items-center justify-center rounded-md text-muted-color transition-colors hover:bg-emphasis hover:text-color"
        aria-label="编辑投票"
        @click="openEdit"
      >
        <Pencil class="size-4" />
      </Button>
    </div>
    <p class="mt-0! mb-2! text-sm font-semibold text-color" :class="{ 'pr-8': canEdit }">
      <Tag class="size-sm mr-2">投票</Tag>
      {{ question }}
    </p>
    <div class="flex flex-col gap-2">
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
    </div>
    <div class="mt-3 flex items-center gap-1.5 text-xs text-muted-color">
      <div v-if="voters.length" class="flex items-center">
        <Avatar
          v-for="(v, i) in voters"
          :key="v.id"
          :user="v"
          card
          shape="circle"
          class="size-5! ring-2 ring-surface-0 dark:ring-surface-900"
          :class="i > 0 ? '-ms-2' : ''"
          :style="{ zIndex: voters.length - i }"
        />
      </div>
      <span>{{ footerText }}</span>
    </div>
  </div>
  <div v-else class="my-[0.8em] rounded-xl border border-surface p-4 text-sm text-muted-color">
    投票不可用
  </div>
</template>
