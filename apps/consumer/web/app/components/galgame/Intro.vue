<script setup lang="ts">
  import { LineClamp, SegmentedControl, Text } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { getRevisionEditPath } from '~/features/revision/resources'

  defineOptions({ name: 'GalgameIntro' })
  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    intros: GalgamePageData['display']['intros']
  }>()

  const LANGUAGES = [
    { value: 'CHINESE_INTRO', label: '中文', lang: 'zh-CN' },
    { value: 'ORIGINAL_INTRO', label: '原文', lang: 'ja' },
  ]
  const options = computed(() =>
    LANGUAGES.filter(item => props.intros.some(intro => intro.property === item.value)),
  )
  const selected = ref(options.value[0]?.value ?? 'CHINESE_INTRO')
  const current = computed(
    () => props.intros.find(intro => intro.property === selected.value)?.values[0] ?? null,
  )
  const lang = computed(() => LANGUAGES.find(item => item.value === selected.value)?.lang)
</script>

<template>
  <EntrySectionHead id="intro" title="简介">
    <template v-if="options.length > 1" #actions>
      <SegmentedControl v-model="selected" :options="options" size="sm" aria-label="简介的语言" />
    </template>
  </EntrySectionHead>
  <LineClamp v-if="current" :key="selected" :lines="5" expand-label="展开" collapse-label="收起">
    <Text :lang="lang" class="leading-relaxed wrap-anywhere whitespace-pre-line">
      {{ current.text }}
    </Text>
  </LineClamp>
  <WorkIntro v-else :edit-to="getRevisionEditPath('galgame', galgame.id)" />
</template>
