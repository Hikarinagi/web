<script setup lang="ts">
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceHeroStats' })

  const props = defineProps<{
    profile: SpacePageData['profile']
    statistics: SpacePageData['statistics']
  }>()

  const stats = computed(() => [
    { key: 'follows', value: props.profile.following_count, label: '关注' },
    { key: 'followers', value: props.profile.follower_count, label: '粉丝' },
    { key: 'join', value: props.statistics.join_days, label: '天', prefix: '加入' },
  ])
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-sm">
    <template v-for="(stat, i) in stats" :key="stat.key">
      <span v-if="i" class="text-surface-300 dark:text-surface-600">·</span>
      <span class="flex items-center gap-1">
        <span v-if="stat.prefix" class="text-muted-color">{{ stat.prefix }}</span>
        <span class="font-semibold text-surface-900 dark:text-surface-100">{{ stat.value }}</span>
        <span class="text-muted-color">{{ stat.label }}</span>
      </span>
    </template>
  </div>
</template>
