<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Empty,
    Heading,
    Inline,
    ScrollArea,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { stripNovelMarkup } from '@hikarinagi/shared'
  import { RotateCcw } from '@lucide/vue'
  import type {
    BackendNovelProject,
    BackendNovelSegment,
    BackendNovelTerm,
  } from '~/features/workbench/workbench'

  const props = defineProps<{
    project: BackendNovelProject
    segment: BackendNovelSegment | null
    number: number | null
    text: string
    terms: BackendNovelTerm[]
    readonly: boolean
  }>()
  const emit = defineEmits<{ useText: [text: string]; changed: [] }>()

  const auth = useAuthStore()
  const hits = computed(() => {
    const source = stripNovelMarkup(props.segment?.text ?? '')
    return props.terms.filter(term => source.includes(term.source))
  })
  const draft = computed(
    () =>
      props.segment?.translations.find(item => item.user.id === auth.user?.id)?.machine_text ??
      null,
  )
  const others = computed(
    () => props.segment?.translations.filter(item => item.user.id !== auth.user?.id) ?? [],
  )
</script>

<template>
  <Stack gap="none" class="h-full">
    <Inline gap="sm" align="center" class="h-11 shrink-0 border-b border-line px-4">
      <Text size="sm" weight="semibold">
        {{ number === null ? '参考资料' : `第 ${number} 段` }}
      </Text>
    </Inline>
    <Empty
      v-if="!segment"
      title="单击一个段落即可在此处查看其参考资料。"
      size="sm"
      class="flex-1"
    />
    <ScrollArea v-else class="min-h-0 flex-1">
      <Stack gap="none" class="divide-y divide-line [&>*]:px-4 [&>*]:py-3.5">
        <Stack v-if="hits.length" gap="sm">
          <Heading :level="3" size="sm">术语</Heading>
          <Inline
            v-for="term in hits"
            :key="term.id"
            v-tooltip="term.note || null"
            gap="sm"
            align="center"
            justify="between"
            :wrap="false"
          >
            <Text size="sm" class="min-w-0">
              {{ term.source }} → {{ term.forbidden ? `禁用 ${term.target}` : term.target }}
            </Text>
            <Tag size="sm" :tone="term.forbidden ? 'danger' : 'neutral'">
              {{ term.forbidden ? '禁用' : term.character_id ? '角色' : '通用' }}
            </Tag>
          </Inline>
        </Stack>
        <Stack v-if="draft" gap="sm">
          <Inline gap="sm" align="center" justify="between">
            <Heading :level="3" size="sm">机翻原稿</Heading>
            <Button
              v-if="!readonly"
              size="sm"
              variant="ghost"
              :disabled="text === draft"
              @click="emit('useText', draft)"
            >
              <template #icon><RotateCcw /></template>
              恢复机翻
            </Button>
          </Inline>
          <WorkbenchMarkupText :text="draft" class="text-sm text-muted" />
        </Stack>
        <Stack v-if="others.length" gap="sm">
          <Heading :level="3" size="sm">译文和校对</Heading>
          <WorkbenchNovelTranslatePanelCandidates
            :project="project"
            :segment="segment"
            @changed="emit('changed')"
            @use-text="value => emit('useText', value)"
          />
        </Stack>
        <WorkbenchNovelTranslatePanelMemory
          :segment-id="segment.id"
          @use-text="value => emit('useText', value)"
        />
        <Stack gap="sm">
          <Heading :level="3" size="sm">批注</Heading>
          <WorkbenchNovelTranslatePanelNotes :segment-id="segment.id" />
        </Stack>
        <Collapsible>
          <Stack gap="sm" align="start">
            <CollapsibleTrigger as-child>
              <Button variant="link" tone="neutral" size="sm">
                修订历史
                <template #trailing><DisclosureIcon /></template>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent class="w-full">
              <WorkbenchNovelTranslatePanelHistory :segment-id="segment.id" />
            </CollapsibleContent>
          </Stack>
        </Collapsible>
      </Stack>
    </ScrollArea>
  </Stack>
</template>
