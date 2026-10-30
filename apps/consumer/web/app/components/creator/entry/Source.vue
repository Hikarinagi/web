<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Inline,
    Link,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { Image as ImageIcon, Link2 } from '@lucide/vue'
  import type { BackendStatement } from '~/features/creator/entry/contract'
  import { accessedText, supportOf } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntrySource' })
  const props = defineProps<{ statement: BackendStatement; label: string }>()

  const citation = computed(() => supportOf(props.statement))
  const tag = computed(() => {
    if (!citation.value) return '没有来源'
    if (citation.value.method === 'IMPORT') return '导入，待补来源'
    if (citation.value.method === 'MEMBER') return '由成员录入，待补来源'
    return null
  })
</script>

<template>
  <Collapsible>
    <Stack gap="xs" class="items-start">
      <Inline gap="sm" align="center">
        <Tag v-if="tag" tone="warning">{{ tag }}</Tag>
        <Inline
          v-else-if="citation?.method === 'SCREENSHOT'"
          gap="sm"
          align="center"
          class="text-xs text-muted"
        >
          <ImageIcon class="size-3.5 shrink-0" aria-hidden="true" />
          <Text as="span" size="xs">
            {{ citation.version ? '作品截图' : '包装照片' }} {{ citation.media.length }} 张
          </Text>
          <Text v-if="citation.version" as="span" size="xs" tone="muted" lang="ja">
            {{ citation.version.label }}
          </Text>
          <Text v-if="citation.location" as="span" size="xs" tone="muted" lang="ja">
            {{ citation.location }}
          </Text>
        </Inline>
        <Inline v-else-if="citation" gap="xs" align="center" class="text-xs text-muted">
          <Link2 class="size-3.5 shrink-0" aria-hidden="true" />
          <Link
            v-if="citation.url"
            as="a"
            :href="citation.url"
            target="_blank"
            rel="noopener noreferrer"
            tone="accent"
          >
            {{ citation.source ?? citation.url }}
          </Link>
          <Text v-else as="span" size="xs">{{ citation.source }}</Text>
          <Text v-if="accessedText(citation.accessed_at)" as="span" size="xs" tone="muted">
            访问于 {{ accessedText(citation.accessed_at) }}
          </Text>
        </Inline>
        <CollapsibleTrigger v-if="statement.citations.length" as-child>
          <Button variant="ghost" tone="neutral" size="xs">
            <template #trailing><DisclosureIcon /></template>
            来源详情
          </Button>
        </CollapsibleTrigger>
      </Inline>
      <CollapsibleContent v-if="statement.citations.length" class="w-full">
        <CreatorEntrySourceDetails :statement="statement" :label="label" />
      </CollapsibleContent>
    </Stack>
  </Collapsible>
</template>
