<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Divider,
    Inline,
    Link,
    Panel,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { TimeFormatEnum, timeFormat } from '#imports'
  import { Link2 } from '@lucide/vue'
  import { SECTION_DOWNSTREAM, SOURCE_FIELD_LABEL, SOURCE_NAME } from '~/features/creator/sources'
  import type { CreatorContributionPageData } from '~~/server/api/pages/create/contributions/[id].get'

  const props = defineProps<{ sources: CreatorContributionPageData['sources'] }>()

  const reasons = computed(() => [
    ...new Set(props.sources.flatMap(work => work.reasons.map(reason => reason.text))),
  ])
  const missing = computed(() => [
    ...new Set(
      props.sources.flatMap(work => {
        const key = SECTION_DOWNSTREAM[work.section]
        return key && !work.records.some(record => record.source === key) ? [key] : []
      }),
    ),
  ])
  const records = computed(() => props.sources.flatMap(work => work.records))
</script>

<template>
  <Panel title="来源" :count="records.length">
    <template #icon><Link2 /></template>
    <Stack gap="md">
      <DescriptionList v-if="reasons.length" orientation="horizontal">
        <DescriptionTerm>需审核原因</DescriptionTerm>
        <DescriptionDetails>{{ reasons.join('；') }}</DescriptionDetails>
      </DescriptionList>
      <template v-for="(record, index) in records" :key="`${record.source}-${index}`">
        <Divider v-if="index > 0 || reasons.length" />
        <Stack gap="sm">
          <Inline gap="sm" align="center">
            <Link v-if="record.url" :href="record.url" target="_blank">
              {{ SOURCE_NAME[record.source] ?? record.source }}
            </Link>
            <Text v-else as="span" weight="medium">
              {{ SOURCE_NAME[record.source] ?? record.source }}
            </Text>
            <Tag size="sm" :tone="record.first_hand ? 'success' : 'neutral'">
              {{ record.first_hand ? '一手源' : '下游源' }}
            </Tag>
            <Text as="span" size="sm" tone="muted" class="ml-auto">
              最近发现于 {{ timeFormat(record.last_seen_at, TimeFormatEnum.M_D_CN) }}
            </Text>
          </Inline>
          <DescriptionList v-if="record.fields.length" orientation="horizontal">
            <template v-for="item in record.fields" :key="item.field">
              <DescriptionTerm>{{ SOURCE_FIELD_LABEL[item.field] ?? item.field }}</DescriptionTerm>
              <DescriptionDetails class="break-all">{{ item.value }}</DescriptionDetails>
            </template>
          </DescriptionList>
        </Stack>
      </template>
      <template v-for="key in missing" :key="key">
        <Divider />
        <Inline gap="sm" align="center">
          <Text as="span" weight="medium">{{ SOURCE_NAME[key] ?? key }}</Text>
          <Tag size="sm" tone="neutral">下游源</Tag>
          <Text as="span" size="sm" tone="muted" class="ml-auto">未找到</Text>
        </Inline>
      </template>
    </Stack>
  </Panel>
</template>
