<script setup lang="ts">
  import { Heading, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { CircleCheck } from '@lucide/vue'
  import type { BackendCheckEvidence } from '~/features/creator/check'
  import { PUBLIC_PATH } from '~/features/creator/duplicates'

  defineProps<{ evidence: BackendCheckEvidence[]; resourceType: string }>()

  const bangumi = (id: number | undefined) => `https://bgm.tv/subject/${id}`
</script>

<template>
  <Stack v-if="evidence.length" gap="xs">
    <Heading :level="3" size="sm">依据</Heading>
    <Stack as="ul" gap="xs">
      <Inline v-for="(item, index) in evidence" :key="index" as="li" gap="sm" :wrap="false">
        <CircleCheck class="size-4 shrink-0 text-success-text" aria-hidden="true" />
        <Text as="span" size="sm" class="min-w-0 flex-1">
          <template v-if="item.kind === 'author'">
            <Link :href="bangumi(item.bangumi_id)" target="_blank" rel="noopener noreferrer">
              Bangumi {{ item.bangumi_id }}
            </Link>
            将{{ item.author }}列为作者，与请求一致
          </template>
          <template v-else-if="item.kind === 'entry'">
            Bangumi {{ item.bangumi_id }} 属于本站
            <Link
              :as="NuxtLink"
              :to="`${PUBLIC_PATH[resourceType] ?? '/'}${item.entry_id}`"
              target="_blank"
            >
              #{{ item.entry_id }}
            </Link>
          </template>
          <template v-else-if="item.kind === 'bangumi_detail' && item.label && item.date">
            其在 Bangumi 的「书系」为{{ item.label }}，发售于 {{ item.date }}
          </template>
          <template v-else-if="item.kind === 'bangumi_detail' && item.label">
            其在 Bangumi 的「书系」为{{ item.label }}
          </template>
          <template v-else-if="item.kind === 'bangumi_detail'">
            其在 Bangumi 的发售日为 {{ item.date }}
          </template>
          <template v-else>openBD 将 ISBN {{ item.isbn }} 列为《{{ item.title }}》</template>
        </Text>
        <Tag v-if="item.verified" size="sm" tone="success">已核实</Tag>
      </Inline>
    </Stack>
  </Stack>
</template>
