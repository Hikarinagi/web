<script setup lang="ts">
  defineOptions({ name: 'Spoiler' })

  const revealed = ref(false)
  function toggle() {
    revealed.value = !revealed.value
  }
</script>

<template>
  <span
    role="button"
    tabindex="0"
    :aria-label="revealed ? '隐藏剧透' : '剧透内容，点击显示'"
    class="hikari-content-spoiler cursor-pointer rounded-sm px-0.5 transition-[filter] duration-150"
    :class="revealed ? '' : 'bg-surface-200 filter-[blur(0.35em)] select-none dark:bg-surface-700'"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <slot />
  </span>
</template>
