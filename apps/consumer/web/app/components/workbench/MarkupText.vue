<script setup lang="ts">
  import { Mark, Tag, Text } from '@hina-ui/vue'
  import { novelTagText, parseNovelMarkup } from '@hikarinagi/shared'
  import { SOURCE_TAG_LABEL } from '~/features/workbench/labels'
  import type { BackendNovelSegment, BackendNovelTerm } from '~/features/workbench/workbench'

  const props = defineProps<{
    text: string
    terms?: BackendNovelTerm[]
    tagged?: boolean
    tags?: BackendNovelSegment['tags']
  }>()

  const pattern = computed(() => {
    const sources = (props.terms ?? [])
      .map(term => term.source)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map(source => source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    return sources.length ? new RegExp(`(${sources.join('|')})`) : null
  })
  const termOf = (part: string) => props.terms?.find(term => term.source === part) ?? null
  const hint = (term: BackendNovelTerm) =>
    [term.forbidden ? `禁用：${term.target}` : term.target, term.note].filter(Boolean).join('\n')
  const tagHint = (id: number) => {
    const kind = props.tags?.find(tag => tag.id === id)?.kind
    return kind ? (SOURCE_TAG_LABEL[kind] ?? null) : null
  }

  const runs = computed(() =>
    parseNovelMarkup(props.text, { tags: props.tagged }).map(run =>
      run.kind === 'text'
        ? { ...run, parts: pattern.value ? run.text.split(pattern.value) : [run.text] }
        : { ...run, parts: [] },
    ),
  )
</script>

<template>
  <Text class="leading-loose whitespace-pre-wrap">
    <template v-for="(run, index) in runs" :key="index">
      <ruby v-if="run.kind === 'ruby'">
        {{ run.base }}<rp>（</rp><rt class="text-xs text-muted">{{ run.ruby }}</rt
        ><rp>）</rp>
      </ruby>
      <Text
        v-else-if="run.kind === 'emphasis'"
        as="em"
        class="not-italic [text-emphasis:filled_dot]"
      >
        {{ run.text }}
      </Text>
      <Tag
        v-else-if="run.kind === 'tag'"
        v-tooltip="tagHint(run.id)"
        size="sm"
        variant="outline"
        tone="info"
        class="mx-0.5 align-baseline font-mono"
      >
        {{ novelTagText(run) }}
      </Tag>
      <template v-for="(part, at) in run.parts" v-else :key="at">
        <Mark v-if="termOf(part)" v-tooltip="hint(termOf(part)!)">{{ part }}</Mark>
        <template v-else>{{ part }}</template>
      </template>
    </template>
  </Text>
</template>
