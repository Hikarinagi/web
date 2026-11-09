<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { KIND_PATHS, today, workMonth, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgCatalogCard' })
  const props = defineProps<{ work: OrgWork }>()

  const to = computed(() => `/${KIND_PATHS[props.work.kind]}/${props.work.id}`)
  const upcoming = computed(() => Boolean(props.work.date) && props.work.date! > today())
</script>

<template>
  <Stack gap="xs" class="min-w-0">
    <NuxtLink :to="to" class="block hn-interactive rounded-md" :aria-label="work.title">
      <EntryBookCover v-if="work.kind !== 'game'" :media="work.cover" :alt="work.title" />
      <HikariImage
        v-else
        :src="work.cover"
        :alt="work.title"
        :ratio="7 / 10"
        :processing="{ width: 320, quality: 80, fit: 'cover', format: 'auto' }"
        image-class="object-cover"
        class="w-full overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5"
      />
    </NuxtLink>
    <Link
      :as="NuxtLink"
      :to="to"
      tone="neutral"
      class="line-clamp-2 text-sm leading-snug font-medium"
    >
      {{ work.title }}
    </Link>
    <Text v-if="work.authors" size="xs" tone="muted" class="truncate" lang="ja">
      {{ work.authors }}
    </Text>
    <Inline gap="sm" align="center" :wrap="false" class="text-xs tabular-nums">
      <Text
        as="span"
        size="xs"
        :tone="upcoming ? undefined : 'muted'"
        :class="upcoming ? 'text-accent-text' : undefined"
      >
        {{ workMonth(work.date) }}
      </Text>
      <Text v-if="work.volumes && !upcoming" as="span" size="xs" tone="muted">
        {{ work.volumes }} 卷
      </Text>
      <Inline v-if="work.rating.average !== null" gap="xs" align="center" :wrap="false">
        <Star class="size-3 fill-current text-warning" />
        <Text as="span" size="xs">{{ work.rating.average.toFixed(1) }}</Text>
      </Inline>
    </Inline>
  </Stack>
</template>
