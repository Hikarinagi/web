<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Link, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { producerRelationLabel } from '~/features/entity/labels'
  import { establishedText } from '~/features/org/works'

  defineOptions({ name: 'OrgFacts' })
  const props = defineProps<{
    producer: ProducerPageData['producer']
    relations: ProducerPageData['relations']
    years: string | null
  }>()

  const groups = computed(() => {
    const map = new Map<string, { id: number; name: string }[]>()
    for (const item of props.relations ?? []) {
      const label = producerRelationLabel(item.relation)
      map.set(label, [...(map.get(label) ?? []), item.target_producer])
    }
    return [...map].map(([label, items]) => ({ label, items }))
  })
  const established = computed(() =>
    establishedText(props.producer.established, props.producer.established_precision),
  )
  const host = computed(() =>
    props.producer.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
  )
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:min-w-0 [&_dd]:text-fg [&_dt]:text-muted"
  >
    <template v-for="group in groups" :key="group.label">
      <DescriptionTerm>{{ group.label }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="item in group.items"
            :key="item.id"
            :as="NuxtLink"
            :to="`/producers/${item.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ item.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="established">
      <DescriptionTerm>成立日期</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ established }}</DescriptionDetails>
    </template>
    <template v-if="producer.location">
      <DescriptionTerm>所在地</DescriptionTerm>
      <DescriptionDetails>{{ producer.location }}</DescriptionDetails>
    </template>
    <template v-if="years">
      <DescriptionTerm>作品年份</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ years }}</DescriptionDetails>
    </template>
    <template v-if="producer.website">
      <DescriptionTerm>官网</DescriptionTerm>
      <DescriptionDetails>
        <Link
          as="a"
          :href="producer.website"
          target="_blank"
          rel="noopener noreferrer"
          tone="neutral"
          class="block truncate"
        >
          {{ host }}
        </Link>
      </DescriptionDetails>
    </template>
    <template v-if="producer.aliases.length">
      <DescriptionTerm>别名</DescriptionTerm>
      <DescriptionDetails lang="ja">{{ producer.aliases.join('、') }}</DescriptionDetails>
    </template>
  </DescriptionList>
</template>
