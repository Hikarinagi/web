<script setup lang="ts">
  import { Card, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { KIND_PATHS, orgWorks, spanText } from '~/features/org/works'

  defineOptions({ name: 'OrgHubLabel' })
  const props = defineProps<{ label: ProducerPageData['extras']['labels'][number] }>()

  const name = computed(
    () => props.label.name ?? (props.label.kind === 'manga' ? '漫画' : '未标文库的轻小说'),
  )
  const covers = computed(() => orgWorks(props.label.recent).filter(work => work.cover))
  const years = computed(() => spanText(props.label.first_date, props.label.last_date))
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
            {{ name }}
          </Link>
          <Text v-else weight="semibold" truncate>{{ name }}</Text>
          <Tag v-if="label.own" size="sm" tone="accent">旗下</Tag>
        </Inline>
        <Text size="sm" class="shrink-0 tabular-nums">{{ label.count }} 部</Text>
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
