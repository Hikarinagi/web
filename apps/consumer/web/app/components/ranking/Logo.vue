<script setup lang="ts">
  import {
    BADGE_HEIGHT,
    BANGS,
    BRAND,
    CAP_STROKE,
    RANKING,
    WORDMARK,
    badgeOf,
  } from '~/features/ranking/logo'
  import type { RankingMedium, RankingPeriod } from '~/features/ranking/ranking'

  defineOptions({ name: 'RankingLogo' })
  const props = defineProps<{ medium: RankingMedium; period: RankingPeriod }>()

  const PERIOD = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY' }
  const MEDIUM = { mangas: 'MANGA', 'light-novels': 'NOVEL' }
  const NAME = { mangas: '漫画', 'light-novels': '轻小说' }
  const ISSUE = { day: '日榜', week: '周榜', month: '月榜' }
  const WORDMARK_SCALE = 0.45
  const WORDMARK_TOP = 22
  const BADGE_LEFT = 768 * WORDMARK_SCALE + 24
  const RANKING_TOP = 104
  const DEPTH = 8

  const badges = computed(() => {
    const period = badgeOf(PERIOD[props.period])
    return [
      { ...period, left: BADGE_LEFT, plate: 'fill-hikari-shiori', ink: 'stroke-white' },
      {
        ...badgeOf(MEDIUM[props.medium]),
        left: BADGE_LEFT + period.width + 8,
        plate: 'fill-fg',
        ink: 'stroke-canvas',
      },
    ]
  })
</script>

<template>
  <svg
    viewBox="0 0 860 270"
    role="img"
    :aria-label="`Hikarinagi Ranking ${NAME[medium]}${ISSUE[period]}`"
    class="block h-auto w-full"
  >
    <g transform="translate(48 0) skewX(-10)">
      <g :transform="`translate(0 ${WORDMARK_TOP}) scale(${WORDMARK_SCALE})`">
        <g
          v-for="([key, x], index) in WORDMARK"
          :key="index"
          :transform="`translate(${x} 0)`"
          :class="BRAND[key]!.accent ? 'fill-hikari-shiori' : 'fill-hikari-primary'"
        >
          <path v-for="d in BRAND[key]!.d" :key="d" fill-rule="evenodd" :d="d" />
        </g>
      </g>
      <g
        v-for="badge in badges"
        :key="badge.plate"
        :transform="`translate(${badge.left} ${WORDMARK_TOP + 4})`"
      >
        <rect
          :width="badge.width"
          :height="BADGE_HEIGHT"
          rx="10"
          transform="skewX(-12) translate(5 0)"
          :class="badge.plate"
        />
        <g
          :transform="badge.inner"
          fill="none"
          :stroke-width="CAP_STROKE"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="badge.ink"
        >
          <path
            v-for="(letter, index) in badge.letters"
            :key="index"
            :d="letter.d"
            :transform="letter.transform"
          />
        </g>
      </g>
      <g
        v-for="layer in ['shade', 'face']"
        :key="layer"
        :transform="
          layer === 'shade'
            ? `translate(${DEPTH} ${RANKING_TOP + DEPTH})`
            : `translate(0 ${RANKING_TOP})`
        "
      >
        <g
          v-for="([key, x], index) in RANKING"
          :key="index"
          :transform="`translate(${x} 0)`"
          :class="layer === 'shade' ? 'fill-hikari-primary' : 'fill-fg'"
        >
          <path v-for="d in BRAND[key]!.d" :key="d" fill-rule="evenodd" :d="d" />
        </g>
        <g
          v-for="bang in BANGS"
          :key="bang"
          :transform="bang"
          :class="layer === 'shade' ? 'fill-hikari-primary' : 'fill-hikari-shiori'"
        >
          <path v-for="d in BRAND['!']!.d" :key="d" fill-rule="evenodd" :d="d" />
        </g>
      </g>
    </g>
  </svg>
</template>
