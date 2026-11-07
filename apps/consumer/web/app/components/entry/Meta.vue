<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import type { components } from '@hikarinagi/api-contract/v3'
  import type { RevisionResourceSlug } from '~/features/revision/resources'

  defineOptions({ name: 'EntryMeta' })
  const props = defineProps<{
    contributors: { contributors: components['schemas']['UserRefDto'][]; count: number } | null
    resourceType: RevisionResourceSlug
    resourceId: number
    updatedAt?: string | null
    external?: { label: string; href: string }[]
    views?: number
  }>()

  const revised = computed(() => (props.updatedAt ? timeFromNow(props.updatedAt) : ''))
</script>

<template>
  <Stack gap="md" class="border-t border-line pt-5 text-sm">
    <Stack v-if="contributors" gap="sm">
      <AvatarStack
        v-if="contributors.contributors.length"
        :users="contributors.contributors"
        :total="contributors.count"
        :max="5"
        size="md"
        card
      />
      <Text size="sm" tone="muted">
        {{ contributors.count }} 位同好参与编辑<template v-if="revised"
          >，{{ revised }}修订</template
        >
      </Text>
    </Stack>
    <RevisionLinks :resource-type="resourceType" :resource-id="resourceId" />
    <Inline gap="md" align="center">
      <Link
        v-for="item in external"
        :key="item.label"
        as="a"
        :href="item.href"
        target="_blank"
        rel="noopener noreferrer"
        tone="neutral"
        class="text-muted"
      >
        {{ item.label }}
      </Link>
      <Text v-if="views !== undefined" size="xs" tone="muted" class="ml-auto tabular-nums">
        {{ views.toLocaleString() }} 次浏览
      </Text>
    </Inline>
  </Stack>
</template>
