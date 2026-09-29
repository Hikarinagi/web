<script setup lang="ts">
  import { Empty, Section, SimpleGrid, Stack } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import { useContributeKind } from '~/features/contribute/useContributeKind'

  const props = defineProps<{ contributors: ContributePageData['contributors'] }>()

  const kind = useContributeKind()
  const items = computed(() => props.contributors[kind.value])
</script>

<template>
  <Section title="贡献墙">
    <SimpleGrid v-if="items.length" min="6rem" gap="lg">
      <Stack
        v-for="item in items"
        :key="item.user.id"
        gap="xs"
        align="center"
        class="min-w-0 text-center"
      >
        <Avatar :user="item.user" card class="size-16!" />
        <UserName :user="item.user" :handle="false" class="max-w-full justify-center" />
        <UserBadges :user="item.user" />
      </Stack>
    </SimpleGrid>
    <Empty v-else title="还没有贡献者" size="sm" />
  </Section>
</template>
