<script setup lang="ts">
  import { Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { today, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgShelfRecent' })
  const props = defineProps<{ works: OrgWork[] }>()

  const since = (() => {
    const date = new Date(today())
    date.setMonth(date.getMonth() - 3)
    return date.toISOString().slice(0, 10)
  })()
  const upcoming = computed(() =>
    props.works.filter(work => work.date && work.date > today()).reverse(),
  )
  const recent = computed(() =>
    props.works.filter(work => work.date && work.date <= today() && work.date >= since),
  )
</script>

<template>
  <Stack v-if="upcoming.length || recent.length" gap="md">
    <EntrySectionHead title="近期与即将发售" :count="upcoming.length + recent.length" />
    <ScrollArea direction="horizontal" class="-mx-4 lg:-mx-1">
      <Inline gap="md" align="start" :wrap="false" class="px-4 pt-1 pb-3 lg:px-1">
        <Stack v-if="upcoming.length" gap="sm" class="shrink-0">
          <Text size="xs" weight="medium" class="text-accent-text">
            即将发售 {{ upcoming.length }}
          </Text>
          <Inline gap="md" align="start" :wrap="false">
            <OrgCatalogCard
              v-for="work in upcoming"
              :key="work.id"
              :work="work"
              class="w-32 shrink-0 lg:w-36"
            />
          </Inline>
        </Stack>
        <Stack
          v-if="recent.length"
          gap="sm"
          :class="cn('shrink-0', upcoming.length && 'border-l border-line pl-4')"
        >
          <Text size="xs" weight="medium" tone="muted">近三个月 {{ recent.length }}</Text>
          <Inline gap="md" align="start" :wrap="false">
            <OrgCatalogCard
              v-for="work in recent"
              :key="work.id"
              :work="work"
              class="w-32 shrink-0 lg:w-36"
            />
          </Inline>
        </Stack>
      </Inline>
    </ScrollArea>
  </Stack>
</template>
