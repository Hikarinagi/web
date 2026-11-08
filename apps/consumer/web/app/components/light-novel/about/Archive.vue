<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { BookMarked, Building2, CalendarDays, Eye, Layers, Tags } from '@lucide/vue'
  import { getLightNovelProducerRelationLabel, getNovelStatusLabel } from '#imports'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelAboutArchive' })
  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    producers: LightNovelPageData['producers']
    contributors: LightNovelPageData['contributors']
  }>()

  const publicationText = computed(
    () => timeFormat(props.lightNovel.publication_date, TimeFormatEnum.YYYY_MM_DD) || '未收录',
  )
  const aliasesText = computed(() => props.lightNovel.other_names.join(' / '))
  const producerGroups = computed(() => {
    const map = new Map<string, { relation: string; items: { id: number; name: string }[] }>()
    for (const p of props.producers) {
      const label = getLightNovelProducerRelationLabel(p.relation)
      if (!map.has(label)) map.set(label, { relation: p.relation, items: [] })
      map.get(label)!.items.push({ id: p.producer.id, name: p.producer.name })
    }
    return [...map.entries()].map(([label, group]) => ({ label, ...group }))
  })
  const bangumiUrl = computed(() =>
    props.lightNovel.bangumi_book_id
      ? `https://bgm.tv/subject/${props.lightNovel.bangumi_book_id}`
      : null,
  )
</script>

<template>
  <ResourceArchiveCard>
    <Stack gap="sm" class="px-5 py-3.5">
      <ResourceArchiveRow :icon="BookMarked">
        {{ getNovelStatusLabel(lightNovel.novel_status) }}
      </ResourceArchiveRow>
      <ResourceArchiveRow :icon="CalendarDays">{{ publicationText }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="lightNovel.total_volumes" :icon="Layers">
        全 {{ lightNovel.total_volumes }} 卷
      </ResourceArchiveRow>

      <ResourceArchiveRow
        v-for="g in producerGroups"
        :key="g.label"
        :icon="Building2"
        :label="g.label"
      >
        <template v-for="(p, i) in g.items" :key="p.id">
          <Text v-if="i > 0" as="span" size="sm" tone="faint">/</Text>
          <Link v-if="g.relation === 'bunko'" :as="NuxtLink" :to="`/light-novels/bunko/${p.id}`">
            {{ p.name }}
          </Link>
          <Text v-else as="span" size="sm">{{ p.name }}</Text>
        </template>
      </ResourceArchiveRow>

      <ResourceArchiveRow v-if="lightNovel.read_times" :icon="Eye">
        {{ lightNovel.read_times }} 次阅读
      </ResourceArchiveRow>
      <ResourceArchiveRow v-if="lightNovel.other_names.length" :icon="Tags" align="start">
        {{ aliasesText }}
      </ResourceArchiveRow>
    </Stack>

    <Inline v-if="bangumiUrl" gap="sm" class="px-5 pb-4">
      <ResourceArchiveExternalChip :href="bangumiUrl">Bangumi</ResourceArchiveExternalChip>
    </Inline>

    <template #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        resource-type="light-novel"
        :resource-id="lightNovel.id"
        :updated-at="lightNovel.revised_at ?? lightNovel.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
