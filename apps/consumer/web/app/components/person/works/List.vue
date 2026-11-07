<script setup lang="ts">
  import { Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { creditRoleLabel } from '~/features/entry/labels'
  import { KIND_LABELS, KIND_PATHS, yearOf, type PersonWork } from '~/features/person/works'

  defineOptions({ name: 'PersonWorksList' })
  const props = defineProps<{ works: PersonWork[] }>()

  const years = computed(() => {
    const groups: { year: string; works: PersonWork[] }[] = []
    for (const work of props.works) {
      const year = yearOf(work.date)
      const last = groups.at(-1)
      if (last?.year === year) last.works.push(work)
      else groups.push({ year, works: [work] })
    }
    return groups
  })
  const subline = (work: PersonWork) =>
    [work.original !== work.title ? work.original : '', work.by ?? ''].filter(Boolean).join('　')
  const roles = (work: PersonWork) => work.roles.map(creditRoleLabel).join('、')
</script>

<template>
  <Stack gap="none" class="divide-y divide-line border-y border-line">
    <Stack
      v-for="group in years"
      :key="group.year"
      gap="none"
      class="py-1 sm:grid sm:grid-cols-[4rem_minmax(0,1fr)]"
    >
      <Text size="sm" weight="semibold" tone="muted" class="pt-3 tabular-nums">
        {{ group.year }}
      </Text>
      <Stack gap="none">
        <Inline
          v-for="work in group.works"
          :key="`${work.kind}${work.id}`"
          gap="md"
          align="center"
          :wrap="false"
          class="py-1.5"
        >
          <NuxtLink
            :to="`/${KIND_PATHS[work.kind]}/${work.id}`"
            class="block shrink-0 hn-interactive rounded-sm"
            :aria-label="work.title"
          >
            <HikariImage
              :src="work.cover"
              :alt="work.title"
              :ratio="7 / 10"
              preset="thumbnail"
              image-class="object-cover"
              class="w-9 overflow-hidden rounded-sm bg-subtle"
            />
          </NuxtLink>
          <Stack gap="none" class="min-w-0 flex-1">
            <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
              <Link
                :as="NuxtLink"
                :to="`/${KIND_PATHS[work.kind]}/${work.id}`"
                tone="neutral"
                class="truncate font-medium"
              >
                {{ work.title }}
              </Link>
              <Tag size="sm" variant="soft" tone="neutral" class="shrink-0">
                {{ KIND_LABELS[work.kind] }}
              </Tag>
            </Inline>
            <Text size="sm" tone="muted" truncate lang="ja">{{ subline(work) }}</Text>
            <Text size="sm" class="sm:hidden">{{ roles(work) }}</Text>
          </Stack>
          <Text size="sm" class="hidden w-48 shrink-0 sm:block">{{ roles(work) }}</Text>
          <Inline
            gap="xs"
            align="center"
            justify="end"
            :wrap="false"
            class="w-16 shrink-0 tabular-nums"
          >
            <template v-if="work.rating.average !== null">
              <Star class="size-3.5 fill-current text-warning" />
              <Text as="span" size="sm" weight="medium">{{ work.rating.average.toFixed(1) }}</Text>
            </template>
          </Inline>
        </Inline>
      </Stack>
    </Stack>
  </Stack>
</template>
