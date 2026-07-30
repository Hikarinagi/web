<script setup lang="ts">
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
  <aside
    :class="[
      'relative block overflow-hidden rounded-(--editor-panel-radius) bg-(--editor-toolbar-bg) p-3 text-inherit',
      !inEditor && 'my-[0.8em]',
    ]"
    v-bind="asideAttrs"
  >
    <NuxtLink v-if="href" :to="href" class="block text-inherit no-underline hover:no-underline">
      <slot />
    </NuxtLink>
    <div v-else class="block cursor-default text-inherit opacity-60">
      <slot />
    </div>
  </aside>
</template>
