<script setup lang="ts">
  import { SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { tagRoute } from '~/features/galgame/explore'
  import { getRevisionEditPath } from '~/features/revision/resources'

  defineOptions({ name: 'GalgameAboutIntro' })
  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    intros: GalgamePageData['display']['intros']
    tags: GalgamePageData['tags']
  }>()

  const LANGUAGES = [
    { value: 'CHINESE_INTRO', label: '中文', lang: 'zh-CN' },
    { value: 'ORIGINAL_INTRO', label: '原文', lang: 'ja' },
    { value: 'ENGLISH_INTRO', label: '英文', lang: 'en' },
  ]
  const options = computed(() =>
    LANGUAGES.filter(item => props.intros.some(intro => intro.property === item.value)),
  )
  const selected = ref(options.value[0]?.value ?? 'CHINESE_INTRO')
  const current = computed(
    () => props.intros.find(intro => intro.property === selected.value)?.values[0] ?? null,
  )
  const lang = computed(() => LANGUAGES.find(item => item.value === selected.value)?.lang)
  const tagLinks = computed(() =>
    props.tags.map(item => ({ id: item.tag.id, name: item.tag.name, to: tagRoute(item.tag.id) })),
  )
</script>

<template>
  <Stack gap="none" class="min-w-0 flex-1 gap-5">
    <SegmentedControl
      v-if="options.length > 1"
      v-model="selected"
      :options="options"
      size="sm"
      aria-label="简介的语言"
      class="self-start"
    />
    <Text v-if="current" :lang="lang" class="leading-relaxed wrap-anywhere whitespace-pre-line">
      {{ current.text }}
    </Text>
    <WorkIntro v-else :edit-to="getRevisionEditPath('galgame', galgame.id)" />
    <WorkTagLinks :tags="tagLinks" />
  </Stack>
</template>
