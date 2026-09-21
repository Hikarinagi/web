<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
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
</script>

<template>
  <Stack
    v-if="contributors"
    gap="none"
    :class="cn('gap-2.5 px-5 pb-4', standalone ? 'pt-4' : 'pt-3')"
  >
    <Text as="span" size="xs" tone="muted">
      由 {{ contributors.count }} 位创作者维护
      <template v-if="revisedText">· {{ revisedText }}修订</template>
    </Text>
    <RevisionLinks :resource-type="resourceType" :resource-id="resourceId" />
    <AvatarStack
      v-if="contributors.contributors.length"
      :users="contributors.contributors"
      :total="contributors.count"
      size="md"
      card
    />
  </Stack>
</template>
