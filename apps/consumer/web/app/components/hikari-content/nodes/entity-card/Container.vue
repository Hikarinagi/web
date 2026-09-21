<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { inject } from 'vue'
  import { ENTITY_CARD_IN_EDITOR_KEY } from './context'

  defineOptions({ name: 'HikariContentNodesEntityCardContainer' })

  const props = defineProps<{
    type: string // 'galgame' / 'light_novel' / ... / 'galgame_rate'
    idAttr: string // 'data-galgame-id' / 'data-light-novel-id' / ...
    id: number | null
    href: string | null // null → 渲染为 disabled (summary 缺失)
  }>()

  const inEditor = inject(ENTITY_CARD_IN_EDITOR_KEY, false)

  const asideAttrs = computed(() => {
    const attrs: Record<string, string> = {
      'data-card-type': props.type,
    }
    attrs[props.idAttr] = String(props.id ?? '')
    return attrs
  })
</script>

<template>
  <Stack
    as="aside"
    gap="none"
    :class="
      cn(
        'relative overflow-hidden rounded-(--editor-panel-radius) bg-(--editor-toolbar-bg) p-3 text-inherit',
        !inEditor && 'my-hikari-node',
      )
    "
    v-bind="asideAttrs"
  >
    <NuxtLink v-if="href" :to="href" class="block text-inherit no-underline hover:no-underline">
      <slot />
    </NuxtLink>
    <Stack v-else gap="none" class="cursor-default text-inherit opacity-60">
      <slot />
    </Stack>
  </Stack>
</template>
