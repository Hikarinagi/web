<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { producerRelationLabel } from '~/features/entity/labels'
  import { dateText } from '~/features/entry/date'

  defineOptions({ name: 'OrgFacts' })
  const props = defineProps<{
    producer: ProducerPageData['producer']
    relations: ProducerPageData['relations']
    years: string | null
  }>()

  const { t } = useLocaleText()
  const groups = computed(() => {
    const map = new Map<string, { id: number; name: string }[]>()
    for (const item of props.relations ?? []) {
      const label = producerRelationLabel(item.relation)
      map.set(label, [...(map.get(label) ?? []), item.target_producer])
    }
    return [...map].map(([label, items]) => ({ label, items }))
  })
  const established = computed(() =>
    dateText(props.producer.established, props.producer.established_precision),
  )
  const ended = computed(() => dateText(props.producer.ended, props.producer.ended_precision))
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
    <template v-if="producer.members.length">
      <DescriptionTerm>{{ t('entity.org.members') }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="member in producer.members"
            :key="member.id"
            :as="NuxtLink"
            :to="`/people/${member.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ member.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="established">
      <DescriptionTerm>{{ t('entity.org.established') }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ established }}</DescriptionDetails>
    </template>
    <template v-if="ended">
      <DescriptionTerm>{{ t('entity.org.ended') }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ ended }}</DescriptionDetails>
    </template>
    <template v-if="producer.location">
      <DescriptionTerm>{{ t('entity.org.location') }}</DescriptionTerm>
      <DescriptionDetails>{{ producer.location }}</DescriptionDetails>
    </template>
    <template v-if="years">
      <DescriptionTerm>{{ t('entity.org.years') }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ years }}</DescriptionDetails>
    </template>
    <template v-if="producer.website">
      <DescriptionTerm>{{ t('entity.org.website') }}</DescriptionTerm>
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
      <DescriptionTerm>{{ t('entity.org.aliases') }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Text v-for="alias in producer.aliases" :key="alias" as="span" size="sm" lang="ja">
            {{ alias }}
          </Text>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
