<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { creditRoleLabel } from '~/features/entry/labels'

  defineOptions({ name: 'OrgCollaborators' })
  const props = defineProps<{
    people: NonNullable<ProducerPageData['collaborators']>
  }>()

  const COLLAPSED = 5
  const all = ref(false)
  const shown = computed(() => (all.value ? props.people : props.people.slice(0, COLLAPSED)))
</script>

<template>
  <Stack v-if="people.length" gap="xs">
    <Inline justify="between" align="baseline">
      <Text size="sm" tone="muted">合作最多</Text>
      <Link
        v-if="people.length > COLLAPSED"
        as="button"
        type="button"
        class="text-xs"
        @click="all = !all"
      >
        {{ all ? '收起' : `全部 ${people.length} 位` }}
      </Link>
    </Inline>
    <Inline
      v-for="person in shown"
      :key="person.person_id"
      gap="sm"
      align="baseline"
      justify="between"
      :wrap="false"
    >
      <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
        <Link
          :as="NuxtLink"
          :to="`/people/${person.person_id}`"
          tone="neutral"
          class="shrink-0 text-sm font-medium"
          lang="ja"
        >
          {{ person.name }}
        </Link>
        <Text size="xs" tone="muted" class="truncate">
          {{ person.codes.map(creditRoleLabel).join('、') }}
        </Text>
      </Inline>
      <Text size="xs" tone="muted" class="shrink-0 tabular-nums">{{ person.count }} 部</Text>
    </Inline>
  </Stack>
</template>
