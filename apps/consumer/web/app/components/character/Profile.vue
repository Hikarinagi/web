<script setup lang="ts">
  import { Inline, Link, Text } from '@hina-ui/vue'
  import { PencilLine } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { components } from '@hikarinagi/api-contract/v3'
  import { profileRows } from '~/features/character/appearances'
  import { getRevisionEditPath } from '~/features/revision/resources'

  defineOptions({ name: 'CharacterProfile' })
  const props = defineProps<{
    profile: components['schemas']['CharacterAppearanceProfileDto']
    characterId: number
  }>()
  const rows = computed(() => profileRows(props.profile))
</script>

<template>
  <Inline gap="none" align="baseline" class="gap-x-5 gap-y-1">
    <Inline v-for="row in rows" :key="row.label" gap="xs" align="baseline" :wrap="false">
      <Text as="span" size="sm" tone="muted">{{ row.label }}</Text>
      <Text as="span" size="sm" weight="medium" class="tabular-nums">{{ row.value }}</Text>
    </Inline>
    <Link
      :as="NuxtLink"
      :to="getRevisionEditPath('character', characterId)"
      target="_blank"
      tone="neutral"
      class="inline-flex items-center gap-1 text-sm text-muted"
    >
      <PencilLine class="size-3.5" />
      补充资料
    </Link>
  </Inline>
</template>
