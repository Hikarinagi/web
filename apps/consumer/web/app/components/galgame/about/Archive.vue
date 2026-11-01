<script setup lang="ts">
  import { Inline, Link, Stack } from '@hina-ui/vue'
  import {
    Building2,
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

  const releaseText = computed(() =>
    props.galgame.release_date_tbd
      ? '未定'
      : timeFormat(props.galgame.release_date, TimeFormatEnum.YYYY_MM_DD) || '未收录',
  )
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
    <Stack gap="sm" class="px-5 py-3.5">
      <ResourceArchiveRow v-if="galgame.adv_type" :icon="Tag">{{
        galgame.adv_type
      }}</ResourceArchiveRow>
      <ResourceArchiveRow :icon="CalendarDays">{{ releaseText }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="platformsText" :icon="Monitor">{{
        platformsText
      }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="galgame.origin_lang" :icon="Languages">
        {{ langLabel(galgame.origin_lang) }}
      </ResourceArchiveRow>
      <ResourceArchiveRow v-if="galgame.engine" :icon="Cpu">{{
        galgame.engine
      }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="priceText" :icon="Coins" align="start">{{
        priceText
      }}</ResourceArchiveRow>
      <ResourceArchiveRow
        v-for="g in producerGroups"
        :key="g.label"
        :icon="Building2"
        :label="g.label"
      >
        {{ g.text }}
      </ResourceArchiveRow>
      <ResourceArchiveRow v-if="galgame.homepage" :icon="Link2">
        <Link
          as="a"
          :href="galgame.homepage"
          target="_blank"
          rel="noopener noreferrer"
          class="truncate"
        >
          {{ homepageText }}
        </Link>
      </ResourceArchiveRow>
      <ResourceArchiveRow v-if="galgame.aliases.length" :icon="Tags" align="start">
        {{ aliasesText }}
      </ResourceArchiveRow>
    </Stack>

    <Inline v-if="galgame.vndb_id || galgame.bangumi_game_id" gap="sm" class="px-5 pb-4">
      <ResourceArchiveExternalChip v-if="vndbUrl" :href="vndbUrl">VNDB</ResourceArchiveExternalChip>
      <ResourceArchiveExternalChip
        v-if="galgame.bangumi_game_id"
        :href="`https://bgm.tv/subject/${galgame.bangumi_game_id}`"
      >
        Bangumi
      </ResourceArchiveExternalChip>
    </Inline>

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
