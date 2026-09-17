<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceHeroStats' })

  const props = defineProps<{
    profile: SpacePageData['profile']
    statistics: SpacePageData['statistics']
  }>()

  const stats = computed(() => [
    { key: 'follows', value: props.profile.following_count, label: '关注' },
    { key: 'followers', value: props.profile.follower_count, label: '粉丝' },
    {
      key: 'played',
      value: props.statistics.played_galgame_count,
      label: '玩过',
    },
    {
      key: 'read',
      value: props.statistics.read_light_novel_count,
      label: '看过',
    },
    { key: 'join', value: props.statistics.join_days, label: '天', prefix: '加入' },
  ])
</script>

<template>
  <Inline gap="sm" class="gap-y-1 pt-0.5">
    <template v-for="(stat, i) in stats" :key="stat.key">
      <Text v-if="i" as="span" size="sm" tone="faint">·</Text>
      <Inline as="span" gap="xs">
        <Text v-if="stat.prefix" as="span" size="sm" tone="muted">{{ stat.prefix }}</Text>
        <Text as="span" size="sm" weight="semibold">{{ stat.value }}</Text>
        <Text as="span" size="sm" tone="muted">{{ stat.label }}</Text>
      </Inline>
    </template>
  </Inline>
</template>
