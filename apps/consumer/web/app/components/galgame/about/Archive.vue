<script setup lang="ts">
  import {
    Building2,
    CalendarCheck,
    CalendarDays,
    Coins,
    Cpu,
    Languages,
    Link2,
    Monitor,
    Tag,
    Tags,
  } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { platformLabel } from '~/features/galgame/platforms'
  import { CURRENCY_SYMBOL, langLabel, producerRoleLabel } from '~/features/galgame/labels'

  defineOptions({ name: 'GalgameAboutArchive' })
  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    producers: GalgamePageData['producers']
    contributors: GalgamePageData['contributors']
  }>()

  const startText = computed(() => {
    if (props.galgame.start_date_tbd) return props.galgame.start_date_tbd_note || '待定'
    if (props.galgame.start_date_year_only) return yearOnlyText(props.galgame.start_date)

    return datePartFormat(props.galgame.start_date, TimeFormatEnum.YYYY_MM_DD) || '未收录'
  })
  const endText = computed(() => {
    if (!props.galgame.end_date) return '—'
    if (props.galgame.end_date_year_only) return yearOnlyText(props.galgame.end_date)

    return datePartFormat(props.galgame.end_date, TimeFormatEnum.YYYY_MM_DD) || '—'
  })

  function yearOnlyText(value: string | null): string {
    // date 字段按日历日处理,取 ISO 前 4 位年份,避免负时区偏移一天
    const year = Number(value?.slice(0, 4))
    return Number.isFinite(year) && year > 0 ? `${year}年` : '未收录'
  }
  const platformsText = computed(() => props.galgame.platforms.map(platformLabel).join(' · '))
  const aliasesText = computed(() => props.galgame.aliases.join(' / '))
  const priceText = computed(() =>
    props.galgame.prices
      .filter(p => p.amount != null)
      .map(p => {
        const symbol = (p.currency && CURRENCY_SYMBOL[p.currency]) || ''
        const label = `${symbol}${Number(p.amount).toLocaleString()}`
        const tax =
          p.tax_included === true ? '（含税）' : p.tax_included === false ? '（不含税）' : ''
        return `${p.version ? `${p.version} ` : ''}${label}${tax}`
      })
      .join(' / '),
  )
  const producerGroups = computed(() => {
    const map = new Map<string, string[]>()
    for (const p of props.producers) {
      const label = producerRoleLabel(p.role) || '厂商'
      const name = p.note ? `${p.producer.name}(${p.note})` : p.producer.name
      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(name)
    }
    return [...map.entries()].map(([label, names]) => ({ label, text: names.join(' / ') }))
  })
  const homepageText = computed(() =>
    props.galgame.homepage?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  )
  const vndbUrl = computed(() =>
    props.galgame.vndb_id != null ? `https://vndb.org/v${props.galgame.vndb_id}` : null,
  )
</script>

<template>
  <ResourceArchiveCard>
    <div class="flex flex-col gap-2.5 px-5 py-3.5 text-[13px]">
      <div v-if="galgame.adv_type" class="flex items-center gap-2.5">
        <Tag class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ galgame.adv_type }}</span>
      </div>
      <div class="flex items-center gap-2.5">
        <CalendarDays class="size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 text-xs text-surface-400">开始时间</span>
          <span class="text-surface-700 dark:text-surface-300">{{ startText }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2.5">
        <CalendarCheck class="size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 text-xs text-surface-400">完结时间</span>
          <span class="text-surface-700 dark:text-surface-300">{{ endText }}</span>
        </span>
      </div>
      <div v-if="platformsText" class="flex items-center gap-2.5">
        <Monitor class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ platformsText }}</span>
      </div>
      <div v-if="galgame.origin_lang" class="flex items-center gap-2.5">
        <Languages class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">
          {{ langLabel(galgame.origin_lang) }}
        </span>
      </div>
      <div v-if="galgame.engine" class="flex items-center gap-2.5">
        <Cpu class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ galgame.engine }}</span>
      </div>
      <div v-if="priceText" class="flex items-start gap-2.5">
        <Coins class="mt-0.5 size-3.5 shrink-0 text-surface-400" />
        <span class="min-w-0 wrap-anywhere text-surface-700 dark:text-surface-300">
          {{ priceText }}
        </span>
      </div>
      <div v-for="g in producerGroups" :key="g.label" class="flex items-center gap-2.5">
        <Building2 class="size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 text-xs text-surface-400">{{ g.label }}</span>
          <span class="min-w-0 wrap-anywhere text-surface-700 dark:text-surface-300">
            {{ g.text }}
          </span>
        </span>
      </div>
      <div v-if="galgame.homepage" class="flex items-center gap-2.5">
        <Link2 class="size-3.5 shrink-0 text-surface-400" />
        <a
          :href="galgame.homepage"
          target="_blank"
          rel="noopener noreferrer"
          class="truncate text-sky-700 hover:underline dark:text-sky-400"
        >
          {{ homepageText }}
        </a>
      </div>
      <div v-if="galgame.aliases.length" class="flex items-start gap-2.5">
        <Tags class="mt-0.5 size-3.5 shrink-0 text-surface-400" />
        <span class="min-w-0 wrap-anywhere text-surface-600 dark:text-surface-400">
          {{ aliasesText }}
        </span>
      </div>
    </div>

    <div v-if="galgame.vndb_id || galgame.bangumi_game_id" class="flex gap-2 px-5 pb-4">
      <a
        v-if="vndbUrl"
        :href="vndbUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-md border border-surface-200 px-2.5 py-1 text-[11px] font-semibold text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
      >
        VNDB
      </a>
      <a
        v-if="galgame.bangumi_game_id"
        :href="`https://bgm.tv/subject/${galgame.bangumi_game_id}`"
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
        resource-type="galgame"
        :resource-id="galgame.id"
        :updated-at="galgame.revised_at ?? galgame.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
