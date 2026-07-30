<script setup lang="ts">
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
    <div class="flex flex-col gap-2.5 px-5 py-3.5 text-[13px]">
      <div class="flex items-center gap-2.5">
        <BookMarked class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">
          {{ getNovelStatusLabel(lightNovel.novel_status) }}
        </span>
      </div>
      <div class="flex items-center gap-2.5">
        <CalendarDays class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ publicationText }}</span>
      </div>
      <div v-if="lightNovel.total_volumes" class="flex items-center gap-2.5">
        <Layers class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">
          全 {{ lightNovel.total_volumes }} 卷
        </span>
      </div>
      <div v-for="g in producerGroups" :key="g.label" class="flex items-center gap-2.5">
        <Building2 class="size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 text-xs text-surface-400">{{ g.label }}</span>
          <span class="min-w-0 wrap-anywhere text-surface-700 dark:text-surface-300">
            <template v-for="(p, i) in g.items" :key="p.id">
              <span v-if="i > 0">/</span>
              <NuxtLink
                v-if="g.relation === 'bunko'"
                :to="`/light-novels/bunko/${p.id}`"
                class="transition-colors hover:text-hikari-primary-600 dark:hover:text-hikari-primary-400"
              >
                {{ p.name }}
              </NuxtLink>
              <span v-else>{{ p.name }}</span>
            </template>
          </span>
        </span>
      </div>
      <div v-if="lightNovel.read_times" class="flex items-center gap-2.5">
        <Eye class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">
          {{ lightNovel.read_times }} 次阅读
        </span>
      </div>
      <div v-if="lightNovel.other_names.length" class="flex items-start gap-2.5">
        <Tags class="mt-0.5 size-3.5 shrink-0 text-surface-400" />
        <span class="min-w-0 wrap-anywhere text-surface-600 dark:text-surface-400">
          {{ aliasesText }}
        </span>
      </div>
    </div>

    <div v-if="bangumiUrl" class="flex gap-2 px-5 pb-4">
      <a
        :href="bangumiUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-md border border-surface-200 px-2.5 py-1 text-[11px] font-semibold text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
      >
        Bangumi
      </a>
    </div>

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
