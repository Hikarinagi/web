<script setup lang="ts">
  import {
    Blockquote,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Inline,
    Link,
    Stack,
  } from '@hina-ui/vue'
  import type {
    BackendStatement,
    BackendStatementCitation,
  } from '~/features/creator/entry/contract'
  import { accessedText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntrySourceDetails' })
  defineProps<{ statement: BackendStatement; sources: BackendStatementCitation[] }>()
</script>

<template>
  <Stack gap="md" class="mt-1 rounded-md bg-subtle p-3">
    <Stack v-for="(citation, index) in sources" :key="index" gap="sm">
      <Blockquote v-if="citation.excerpt" class="text-sm whitespace-pre-line" lang="ja">
        {{ citation.excerpt }}
      </Blockquote>
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
      <DescriptionList orientation="horizontal" class="text-xs text-muted">
        <template v-if="citation.url">
          <DescriptionTerm>网址</DescriptionTerm>
          <DescriptionDetails class="break-all">{{ citation.url }}</DescriptionDetails>
        </template>
        <template v-if="citation.version">
          <DescriptionTerm>版本</DescriptionTerm>
          <DescriptionDetails lang="ja">{{ citation.version.label }}</DescriptionDetails>
        </template>
        <template v-if="citation.location">
          <DescriptionTerm>位置</DescriptionTerm>
          <DescriptionDetails lang="ja">{{ citation.location }}</DescriptionDetails>
        </template>
        <template v-if="citation.accessed_at">
          <DescriptionTerm>访问时间</DescriptionTerm>
          <DescriptionDetails>{{ accessedText(citation.accessed_at, true) }}</DescriptionDetails>
        </template>
        <template v-if="citation.archive_url">
          <DescriptionTerm>存档</DescriptionTerm>
          <DescriptionDetails>
            <Link
              as="a"
              :href="citation.archive_url"
              target="_blank"
              rel="noopener noreferrer"
              tone="accent"
            >
              网页存档
            </Link>
          </DescriptionDetails>
        </template>
        <template v-if="index === sources.length - 1">
          <DescriptionTerm>添加者</DescriptionTerm>
          <DescriptionDetails>
            <Inline gap="sm" align="center" :wrap="false">
              <Avatar :user="statement.editor" class="size-5!" />
              <UserName :user="statement.editor" class="min-w-0" />
            </Inline>
          </DescriptionDetails>
        </template>
      </DescriptionList>
    </Stack>
  </Stack>
</template>
