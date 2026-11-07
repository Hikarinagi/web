<script setup lang="ts">
  import { Card, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { KIND_PATHS, today, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgHubLabel' })
  const props = defineProps<{
    label: { id: number | null; name: string; works: OrgWork[]; own: boolean }
  }>()

  const covers = computed(() =>
    props.label.works.filter(work => work.cover && work.date && work.date <= today()).slice(0, 5),
  )
  const years = computed(() => {
    const dates = props.label.works
      .flatMap(work => work.date ?? [])
      .map(date => date.slice(0, 4))
      .sort()
    return dates.length ? `${dates[0]} 年至 ${dates.at(-1)} 年` : null
  })
</script>

<template>
  <Card :padded="false">
    <Stack gap="sm" class="p-3">
      <Inline justify="between" align="baseline" gap="md" :wrap="false">
        <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
          <Link
            v-if="label.id"
            :as="NuxtLink"
            :to="`/producers/${label.id}`"
            tone="neutral"
            class="truncate font-semibold"
            lang="ja"
          >
            {{ label.name }}
          </Link>
          <Text v-else weight="semibold" truncate>{{ label.name }}</Text>
          <Tag v-if="label.own" size="sm" tone="accent">旗下</Tag>
        </Inline>
        <Text size="sm" class="shrink-0 tabular-nums">{{ label.works.length }} 部</Text>
      </Inline>
      <Inline gap="xs" :wrap="false">
        <NuxtLink
          v-for="work in covers"
          :key="work.id"
          :to="`/${KIND_PATHS[work.kind]}/${work.id}`"
          class="block w-11 shrink-0 hn-interactive overflow-hidden rounded-xs"
          :aria-label="work.title"
        >
          <HikariImage
            :src="work.cover"
            :alt="work.title"
            :ratio="7 / 10"
            preset="thumbnail"
            image-class="object-cover"
          />
        </NuxtLink>
      </Inline>
      <Text v-if="years" size="xs" tone="muted" class="tabular-nums">{{ years }}</Text>
    </Stack>
  </Card>
</template>
