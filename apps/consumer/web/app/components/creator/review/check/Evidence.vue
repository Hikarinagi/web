<script setup lang="ts">
  import { Heading, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { CircleCheck } from '@lucide/vue'
  import type { BackendCheckEvidence } from '~/features/creator/check'
  import { PUBLIC_PATH } from '~/features/creator/duplicates'

  const props = defineProps<{ evidence: BackendCheckEvidence[]; resourceType: string }>()

  const bangumi = (id: number | undefined) => `https://bgm.tv/subject/${id}`

  function external(item: BackendCheckEvidence, type?: string) {
    if (item.source === 'vndb')
      return { text: `VNDB ${item.ref}`, url: `https://vndb.org/${item.ref}` }
    if (item.source === 'openbd') return { text: `openBD ${item.ref}`, url: '' }
    if (type === 'PERSON' || type === 'PRODUCER') {
      return { text: `Bangumi 人物 ${item.ref}`, url: `https://bgm.tv/person/${item.ref}` }
    }
    if (type === 'CHARACTER') {
      return { text: `Bangumi 角色 ${item.ref}`, url: `https://bgm.tv/character/${item.ref}` }
    }
    return { text: `Bangumi ${item.ref}`, url: `https://bgm.tv/subject/${item.ref}` }
  }
  const owner = (item: BackendCheckEvidence) =>
    external(item, item.resource_type ?? props.resourceType)
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
          <template v-else-if="item.kind === 'vndb_title'">
            <Link
              :href="`https://vndb.org/${item.vndb_id}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              VNDB {{ item.vndb_id }}
            </Link>
            的原名与请求一致
          </template>
          <template v-else-if="item.kind === 'external_owned'">
            <Link :href="owner(item).url" target="_blank" rel="noopener noreferrer">
              {{ owner(item).text }}
            </Link>
            属于本站
            <Link
              :as="NuxtLink"
              :to="`${PUBLIC_PATH[item.resource_type ?? resourceType] ?? '/'}${item.entry_id}`"
              target="_blank"
            >
              #{{ item.entry_id }}
            </Link>
          </template>
          <template v-else-if="item.kind === 'credited'">
            <Link :href="external(item).url" target="_blank" rel="noopener noreferrer">
              {{ external(item).text }}
            </Link>
            《{{ item.work }}》将{{ item.name }}列为{{
              resourceType === 'PRODUCER' ? '开发商' : '作者'
            }}
          </template>
          <template v-else-if="item.kind === 'name_key'">
            {{ item.name }}与{{ item.existing }}的名称键相同
          </template>
          <template v-else-if="item.kind === 'external_record'">
            <Link :href="owner(item).url" target="_blank" rel="noopener noreferrer">
              {{ owner(item).text }}
            </Link>
            为{{ item.name }}
          </template>
          <template v-else-if="item.kind === 'release'">
            {{ external(item).text }} 记录原版发售于 {{ item.date }}
          </template>
          <template v-else>openBD 将 ISBN {{ item.isbn }} 列为《{{ item.title }}》</template>
        </Text>
        <Tag v-if="item.verified" size="sm" tone="success">已核实</Tag>
      </Inline>
    </Stack>
  </Stack>
</template>
