<script setup lang="ts">
  import { Inline, Link, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { SONG_KIND_LABELS } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameCrewName' })
  const props = defineProps<{
    credit: {
      text: string
      person_id: number | null
      producer_id: number | null
      song?: string | null
      song_kind?: string | null
    }
    plain?: boolean
  }>()

  const to = computed(() =>
    props.credit.person_id
      ? `/people/${props.credit.person_id}`
      : props.credit.producer_id
        ? `/producers/${props.credit.producer_id}`
        : null,
  )
  const kind = computed(() =>
    props.credit.song_kind ? SONG_KIND_LABELS[props.credit.song_kind] : null,
  )
</script>

<template>
  <Inline as="span" gap="none" align="baseline" class="gap-1.5">
    <Link v-if="to" :as="NuxtLink" :to="to" tone="neutral" lang="ja">
      {{ credit.text }}
    </Link>
    <Text v-else as="span" size="sm" lang="ja">{{ credit.text }}</Text>
    <Text v-if="credit.song" as="span" size="xs" tone="muted" lang="ja">{{ credit.song }}</Text>
    <Text v-if="kind && !plain" as="span" size="xs" tone="muted">{{ kind }}</Text>
  </Inline>
</template>
