<script setup lang="ts">
  import { Button as HnButton, Chip, Inline, Stack, Text } from '@hina-ui/vue'
  import { Eye, Plus } from '@lucide/vue'
  import type { WorkTag, WorkTagResource } from '~/features/entry/tags'
  import { useWorkTags } from '~/features/entry/useWorkTags'

  defineOptions({ name: 'EntryTags' })
  const props = defineProps<{
    resource: WorkTagResource
    workId: number
    tags: { likes: number; tag: { id: number; name: string; spoiler: boolean } }[]
    tagRoute: (id: number) => string
    cast: { name: string; names: string[] }[]
    castSection: string
  }>()

  const COLLAPSED = 12
  const control = useWorkTags(props.resource, props.workId, props.tags)
  const { shown, spoilers } = control
  const open = ref(false)
  const all = ref(false)
  const reveal = ref(false)
  const listed = computed(() => [...shown.value, ...(reveal.value ? spoilers.value : [])])
  const visible = computed(() => (all.value ? listed.value : listed.value.slice(0, COLLAPSED)))
  const hint = (tag: WorkTag) => (tag.proposed ? '仅你可见' : `${tag.likes} 位成员认为符合`)
</script>

<template>
  <Stack gap="sm">
    <Inline justify="between" align="center">
      <Text size="sm" tone="muted">标签</Text>
      <IconButton
        label="添加标签"
        login-required
        size="sm"
        variant="ghost"
        tone="neutral"
        @click="open = true"
      >
        <Plus />
      </IconButton>
    </Inline>
    <Inline v-if="listed.length || spoilers.length" gap="xs">
      <NuxtLink
        v-for="tag in visible"
        :key="tag.id"
        v-slot="{ href, navigate }"
        :to="tagRoute(tag.id)"
        custom
      >
        <Chip
          v-tooltip="hint(tag)"
          as="a"
          :href="href"
          size="sm"
          :variant="tag.proposed ? 'outline' : 'soft'"
          :class="tag.proposed ? 'border-dashed' : undefined"
          @click="navigate"
        >
          {{ tag.name }}
        </Chip>
      </NuxtLink>
      <HnButton
        v-if="listed.length > COLLAPSED"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="all = !all"
      >
        {{ all ? '收起' : `全部 ${listed.length}` }}
      </HnButton>
      <HnButton
        v-if="spoilers.length && !reveal"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="reveal = true"
      >
        <template #icon><Eye /></template>
        显示 {{ spoilers.length }} 个可能剧透的标签
      </HnButton>
    </Inline>
    <EntryTagsDialog
      v-model:open="open"
      :control="control"
      :resource="resource"
      :work-id="workId"
      :cast="cast"
      :cast-section="castSection"
    />
  </Stack>
</template>
