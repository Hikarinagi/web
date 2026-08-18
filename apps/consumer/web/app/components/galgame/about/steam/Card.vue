<script setup lang="ts">
  import { ExternalLink, Volume2 } from '@lucide/vue'
  import type { GalgameSteamData } from '~~/server/api/pages/galgames/[id]/steam.get'

  defineOptions({ name: 'GalgameAboutSteamCard' })
  const props = defineProps<{ app: GalgameSteamData['apps'][number] }>()

  const credit = computed(() => {
    const publishers = props.app.publishers.filter(name => !props.app.developers.includes(name))
    return [props.app.release_date, props.app.developers.join('、'), publishers.join('、')]
      .filter(Boolean)
      .join(' · ')
  })

  const meter = computed(() => {
    const review = props.app.review
    if (!review) return []

    const color =
      review.percent >= 80
        ? 'var(--p-green-500)'
        : review.percent >= 40
          ? 'var(--p-amber-500)'
          : 'var(--p-red-500)'

    return [{ label: review.desc, value: review.percent, color }]
  })

  const tags = computed(() => {
    const plain = [
      ...props.app.platforms,
      props.app.achievements > 0 ? `${props.app.achievements} 个成就` : '',
      props.app.has_demo ? '有体验版' : '',
    ].filter(Boolean)

    return [
      ...props.app.languages.map(language => ({
        key: `language-${language.name}`,
        label: language.name,
        highlight: language.name.includes('中文'),
        audio: language.full_audio,
      })),
      ...plain.map(label => ({ key: label, label, highlight: false, audio: false })),
    ]
  })
</script>

<template>
  <article
    class="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
  >
    <div class="flex flex-col gap-4 p-4 sm:flex-row">
      <HikariImage
        :src="app.header_image"
        :alt="app.name"
        class="aspect-92/43 w-full shrink-0 overflow-hidden rounded-lg sm:w-64"
        image-class="size-full object-cover"
      />

      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex items-start justify-between gap-3">
          <h4 class="min-w-0 text-base font-semibold text-surface-900 dark:text-surface-0">
            {{ app.name }}
          </h4>
          <div class="flex shrink-0 items-center gap-2">
            <Tag v-if="app.region_locked" severity="warn" value="国区不可用" />
            <template v-else-if="app.is_free || app.price">
              <Tag
                v-if="app.price && app.price.discount_percent > 0"
                severity="success"
                :value="`-${app.price.discount_percent}%`"
              />
              <span
                v-if="app.price?.original"
                class="text-xs text-surface-400 line-through dark:text-surface-500"
              >
                {{ app.price.original }}
              </span>
              <span class="text-[15px] font-semibold text-surface-900 dark:text-surface-0">
                {{ app.price ? app.price.final : '免费' }}
              </span>
            </template>
          </div>
        </div>

        <p
          v-if="app.short_description"
          class="line-clamp-2 text-[13px] leading-5 text-surface-600 dark:text-surface-400"
        >
          {{ app.short_description }}
        </p>

        <p v-if="credit" class="text-[13px] text-surface-500 dark:text-surface-400">
          {{ credit }}
        </p>

        <Button
          as="a"
          :href="app.url"
          target="_blank"
          rel="noopener noreferrer"
          severity="secondary"
          size="small"
          label="在 Steam 上查看"
          class="mt-auto self-start"
        >
          <template #icon>
            <ExternalLink :size="14" />
          </template>
        </Button>
      </div>
    </div>

    <div
      v-if="app.review || tags.length"
      class="flex flex-col gap-3 border-t border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-950"
    >
      <MeterGroup v-if="meter.length" :value="meter" label-position="start" class="gap-2!" />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div v-if="tags.length" class="flex flex-wrap gap-1.5">
          <Tag
            v-for="tag in tags"
            :key="tag.key"
            :severity="tag.highlight ? undefined : 'secondary'"
          >
            {{ tag.label }}
            <Volume2 v-if="tag.audio" v-tooltip.top="'含完整语音'" :size="11" />
          </Tag>
        </div>

        <p v-if="app.review" class="text-xs text-surface-500 dark:text-surface-400">
          {{ app.review.total.toLocaleString('zh-CN') }} 条评价
        </p>
      </div>
    </div>
  </article>
</template>
