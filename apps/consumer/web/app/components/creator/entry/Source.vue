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
  import { Image as ImageIcon, Link as LinkIcon } from '@lucide/vue'
  import type { BackendStatement } from '~/features/creator/entry/contract'
  import { accessedText, sourcesOf } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntrySource' })
  const props = defineProps<{ statement: BackendStatement }>()

  const sources = computed(() => sourcesOf(props.statement))
  const open = ref(false)
  const quoted = computed(() => sources.value.some(citation => citation.excerpt))
  const versions = computed(() => props.statement.versions.map(item => item.label).join('、'))
</script>

<template>
  <Inline v-if="!sources.length" gap="sm" align="center">
    <Tag tone="warning">无来源</Tag>
    <Text v-if="versions" as="span" size="xs" tone="muted" lang="ja">{{ versions }}</Text>
  </Inline>
  <Collapsible v-else v-model:open="open">
    <Stack gap="xs">
      <Inline gap="sm" align="center" wrap class="gap-y-1 text-xs text-muted [&_svg]:size-3">
        <template v-for="(citation, index) in sources" :key="index">
          <template v-if="citation.method === 'SCREENSHOT'">
            <ImageIcon v-if="!index" class="shrink-0" aria-hidden="true" />
            <Text as="span" size="xs" tone="muted">
              {{ citation.version ? '作品截图' : '包装照片' }} {{ citation.media.length }} 张
            </Text>
            <Text v-if="citation.location" as="span" size="xs" tone="muted" lang="ja">
              {{ citation.location }}
            </Text>
          </template>
          <template v-else>
            <LinkIcon v-if="!index" class="shrink-0" aria-hidden="true" />
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
            <Text v-else as="span" size="xs" tone="muted">{{ citation.source }}</Text>
          </template>
          <Text
            v-if="!index && accessedText(citation.accessed_at)"
            as="span"
            size="xs"
            tone="muted"
          >
            访问于 {{ accessedText(citation.accessed_at) }}
          </Text>
        </template>
        <Text v-if="versions" as="span" size="xs" tone="muted" lang="ja">{{ versions }}</Text>
        <CollapsibleTrigger v-if="quoted" as-child>
          <Button variant="ghost" tone="neutral" size="xs">
            {{ open ? '收起原文' : '原文' }}
            <template #trailing><DisclosureIcon /></template>
          </Button>
        </CollapsibleTrigger>
      </Inline>
      <CollapsibleContent v-if="quoted">
        <CreatorEntrySourceDetails :statement="statement" :sources="sources" />
      </CollapsibleContent>
    </Stack>
  </Collapsible>
</template>
