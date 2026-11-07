<script setup lang="ts">
  import { Card, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { dayText } from '~/features/entry/date'
  import { creditRoleLabel } from '~/features/entry/labels'
  import { KIND_PATHS, peopleNames, today, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgHistoryRow' })
  const props = defineProps<{ work: OrgWork }>()

  const to = computed(() => `/${KIND_PATHS[props.work.kind]}/${props.work.id}`)
  const staff = computed(() =>
    ['ORIGINAL_ART', 'SCENARIO']
      .map(code => ({ label: creditRoleLabel(code), names: peopleNames(props.work, code) }))
      .filter(line => line.names),
  )
  const upcoming = computed(() => Boolean(props.work.date) && props.work.date! > today())
</script>

<template>
  <Card :padded="false">
    <Inline gap="lg" align="start" :wrap="false" class="p-3">
      <NuxtLink
        :to="to"
        class="block w-24 shrink-0 hn-interactive rounded-md lg:w-28"
        :aria-label="work.title"
      >
        <HikariImage
          :src="work.cover"
          :alt="work.title"
          :ratio="7 / 10"
          :processing="{ width: 240, quality: 80, fit: 'cover', format: 'auto' }"
          image-class="object-cover"
          class="w-full overflow-hidden rounded-md bg-white ring-1 ring-black/5"
        />
      </NuxtLink>
      <Stack gap="xs" class="min-w-0 flex-1 py-0.5">
        <Text size="xs" :class="cn('tabular-nums', upcoming ? 'text-accent-text' : 'text-muted')">
          {{ work.date ? dayText(work.date) : '日期不详' }}{{ upcoming ? ' 发售' : '' }}
        </Text>
        <Link
          :as="NuxtLink"
          :to="to"
          tone="neutral"
          class="line-clamp-2 leading-snug font-semibold"
        >
          {{ work.title }}
        </Link>
        <Text v-if="work.original !== work.title" size="xs" tone="muted" truncate lang="ja">
          {{ work.original }}
        </Text>
        <Inline
          v-if="work.rating.average !== null"
          gap="xs"
          align="center"
          :wrap="false"
          class="text-sm tabular-nums"
        >
          <Star class="size-3.5 fill-current text-warning" />
          <Text as="span" size="sm" weight="semibold">{{ work.rating.average.toFixed(1) }}</Text>
          <Text as="span" size="xs" tone="muted">{{ work.rating.count }} 人评分</Text>
        </Inline>
        <Stack gap="none" class="pt-1">
          <Inline
            v-for="line in staff"
            :key="line.label"
            gap="sm"
            align="baseline"
            :wrap="false"
            class="min-w-0"
          >
            <Text as="span" size="xs" tone="muted" class="w-7 shrink-0">{{ line.label }}</Text>
            <Text as="span" size="xs" truncate lang="ja">{{ line.names }}</Text>
          </Inline>
        </Stack>
      </Stack>
    </Inline>
  </Card>
</template>
