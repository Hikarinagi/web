<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import type { OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgCatalogYears' })
  const props = defineProps<{ works: OrgWork[] }>()
  const year = defineModel<string | null>({ required: true })

  const bars = computed(() => {
    const counts = new Map<number, number>()
    for (const work of props.works) {
      if (!work.date) continue
      const value = Number(work.date.slice(0, 4))
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
    const max = Math.max(0, ...counts.values())
    if (max < 2) return []
    const years = [...counts.keys()]
    const first = Math.min(...years)
    const last = Math.max(...years)
    return Array.from({ length: last - first + 1 }, (_, index) => {
      const value = first + index
      const count = counts.get(value) ?? 0
      return {
        year: String(value),
        count,
        height: count ? Math.max(12, Math.round((count / max) * 100)) : 0,
      }
    })
  })
  const picked = computed(() => bars.value.find(bar => bar.year === year.value) ?? null)
</script>

<template>
  <Stack v-if="bars.length > 1" gap="xs">
    <Inline gap="none" align="end" :wrap="false" class="h-12 gap-px border-b border-line">
      <Stack
        v-for="bar in bars"
        :key="bar.year"
        v-tooltip="bar.count ? `${bar.year} 年，${bar.count} 部` : undefined"
        as="button"
        type="button"
        gap="none"
        justify="end"
        class="group h-full min-w-0 flex-1 cursor-pointer disabled:cursor-default"
        :disabled="!bar.count"
        :aria-label="`${bar.year} 年 ${bar.count} 部`"
        :aria-pressed="year === bar.year"
        @click="year = year === bar.year ? null : bar.year"
      >
        <Stack
          gap="none"
          :class="
            cn(
              'w-full rounded-t-xs transition-colors duration-(--hn-duration-fast)',
              year === bar.year
                ? 'bg-accent'
                : year
                  ? 'bg-line-strong group-hover:bg-muted'
                  : 'bg-accent/40 group-hover:bg-accent/70',
            )
          "
          :style="{ height: `${bar.height}%` }"
        />
      </Stack>
    </Inline>
    <Inline justify="between" align="center" :wrap="false" class="tabular-nums">
      <Text as="span" size="xs" tone="muted">{{ bars[0]?.year }}</Text>
      <Inline v-if="picked" gap="sm" align="center" :wrap="false">
        <Text as="span" size="xs">{{ picked.year }} 年，{{ picked.count }} 部</Text>
        <Link as="button" type="button" class="text-xs" @click="year = null">显示全部年份</Link>
      </Inline>
      <Text as="span" size="xs" tone="muted">{{ bars.at(-1)?.year }}</Text>
    </Inline>
  </Stack>
</template>
