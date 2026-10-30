<script setup lang="ts">
  import { Blockquote, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import type { BackendStatement } from '~/features/creator/entry/contract'
  import { accessedText } from '~/features/creator/entry/values'
  import { importSourceText } from '~/features/entry/labels'

  defineOptions({ name: 'CreatorEntrySourceDetails' })
  const props = defineProps<{ statement: BackendStatement; label: string }>()

  type Citation = BackendStatement['citations'][number]
  const METHODS: Record<string, string> = {
    RECORD: '结构化记录',
    EXCERPT: '页面摘录',
    SCREENSHOT: '截图',
    MEMBER: '由成员录入',
  }
  const VERIFICATIONS: Record<string, string> = {
    PASSED: '已核验',
    UNCHECKED: '未核验',
    EXCERPT_NOT_FOUND: '页面中未找到此摘录',
    VALUE_MISMATCH: '摘录与该值不符',
    UNREACHABLE: '无法打开来源页面',
    UNCONFIRMED_MATCH: '来源页面未明确指向该条目',
  }
  const method = (citation: Citation) =>
    citation.method === 'IMPORT'
      ? `从 ${importSourceText(citation.origin?.split(',') ?? [])} 导入`
      : (METHODS[citation.method] ?? citation.method)
  const verification = (citation: Citation) =>
    citation.method === 'IMPORT' || citation.method === 'MEMBER'
      ? null
      : citation.verification === 'SOURCE_NOT_ALLOWED'
        ? `该来源无法用于${props.label}`
        : (VERIFICATIONS[citation.verification] ?? citation.verification)
</script>

<template>
  <Stack gap="md" class="rounded-md bg-subtle p-3">
    <Stack v-for="(citation, index) in statement.citations" :key="index" gap="xs">
      <Inline gap="sm" align="center">
        <Text as="span" size="xs" weight="medium">{{ method(citation) }}</Text>
        <Tag v-if="citation.role === 'LINK'" tone="neutral">表明所列名称对应所关联的条目</Tag>
        <Tag v-else-if="citation.role === 'CONTRADICT'" tone="danger">与该值矛盾</Tag>
        <Text
          v-if="verification(citation)"
          as="span"
          size="xs"
          :tone="citation.verification === 'PASSED' ? 'success' : 'muted'"
        >
          {{ verification(citation) }}
        </Text>
      </Inline>
      <Link
        v-if="citation.url"
        as="a"
        :href="citation.url"
        target="_blank"
        rel="noopener noreferrer"
        tone="accent"
        class="text-xs break-all"
      >
        {{ citation.source ?? citation.url }}
      </Link>
      <Text v-else-if="citation.source" as="span" size="xs">{{ citation.source }}</Text>
      <Blockquote v-if="citation.excerpt" class="text-xs">{{ citation.excerpt }}</Blockquote>
      <Text v-if="citation.version" as="span" size="xs" tone="muted" lang="ja">
        版本：{{ citation.version.label }}
      </Text>
      <Text v-if="citation.location" as="span" size="xs" tone="muted">
        位置：{{ citation.location }}
      </Text>
      <HikariImageGroup v-if="citation.media.length" class="flex-row flex-wrap gap-2">
        <HikariImage
          v-for="media in citation.media"
          :key="media.id"
          :src="media"
          alt=""
          preset="small"
          class="h-16 w-28 overflow-hidden rounded-sm"
          image-class="size-full object-cover"
        />
      </HikariImageGroup>
      <Inline gap="md" align="center">
        <Link
          v-if="citation.archive_url"
          as="a"
          :href="citation.archive_url"
          target="_blank"
          rel="noopener noreferrer"
          tone="accent"
          class="text-xs"
        >
          存档副本
        </Link>
        <Text v-if="accessedText(citation.accessed_at)" as="span" size="xs" tone="muted">
          访问于 {{ accessedText(citation.accessed_at) }}
        </Text>
      </Inline>
    </Stack>
  </Stack>
</template>
