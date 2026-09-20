<script setup lang="ts">
  import type { components } from '@hikarinagi/api-contract/v3'
  import type { RevisionResourceSlug } from '~/features/revision/resources'

  type ResourceContributors = {
    contributors: components['schemas']['UserRefDto'][]
    count: number
  }

  const props = withDefaults(
    defineProps<{
      contributors: ResourceContributors | null
      resourceType: RevisionResourceSlug
      resourceId: number
      updatedAt?: string | null
      standalone?: boolean
    }>(),
    {
      updatedAt: null,
      standalone: false,
    },
  )

  const revisedText = computed(() => (props.updatedAt ? timeFromNow(props.updatedAt) : ''))
  const restCount = computed(() =>
    Math.max((props.contributors?.count ?? 0) - (props.contributors?.contributors.length ?? 0), 0),
  )
</script>

<template>
  <div
    v-if="contributors"
    class="flex flex-col gap-2.5 px-5 pb-4"
    :class="standalone ? 'pt-4' : 'pt-3'"
  >
    <span class="text-[11px] text-surface-500 dark:text-surface-400">
      由 {{ contributors.count }} 位创作者维护
      <template v-if="revisedText">· {{ revisedText }}修订</template>
    </span>
    <RevisionLinks :resource-type="resourceType" :resource-id="resourceId" />
    <div v-if="contributors.contributors.length" class="flex items-center -space-x-2">
      <UserCardTrigger v-for="u in contributors.contributors" :key="u.id" :user-id="u.id">
        <Avatar
          :user="u"
          shape="circle"
          class="size-6! ring-2 ring-surface-0 transition-transform dark:ring-surface-900"
        />
      </UserCardTrigger>
      <span
        v-if="restCount > 0"
        class="z-10 flex size-6 items-center justify-center rounded-full bg-surface-100 text-[10px] font-semibold text-surface-500 ring-2 ring-surface-0 dark:bg-surface-800 dark:text-surface-400 dark:ring-surface-900"
      >
        +{{ restCount }}
      </span>
    </div>
  </div>
</template>
