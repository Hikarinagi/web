<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import type { components } from '@hikarinagi/api-contract/v3'
  import { displayName } from '~/utils/user'

  const props = defineProps<{ users: components['schemas']['UserRefDto'][] }>()

  const names = computed(() => props.users.map(user => displayName(user)).join('、'))
</script>

<template>
  <Inline
    v-if="users.length"
    v-tooltip="`当前编辑：${names}`"
    gap="xs"
    align="center"
    :wrap="false"
  >
    <AvatarStack :users="users" :max="5" size="sm" />
    <Text size="xs" tone="muted" class="shrink-0 whitespace-nowrap">
      {{ users.length }} 人在线
    </Text>
  </Inline>
</template>
