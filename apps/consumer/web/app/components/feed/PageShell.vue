<script setup lang="ts">
  const slots = useSlots()

  useHead({
    htmlAttrs: { class: slots.nav ? 'overscroll-none page-wide' : 'overscroll-none' },
  })
</script>

<template>
  <div class="px-4 py-4 sm:px-6 sm:py-6">
    <div
      class="mx-auto flex flex-col items-center gap-6 px-0 sm:px-4"
      :class="$slots.nav ? 'max-w-7xl' : 'max-w-5xl'"
    >
      <slot name="top" />
      <div class="flex w-full justify-center gap-8">
        <aside v-if="$slots.nav" class="hidden w-44 shrink-0 xl:block">
          <div class="sticky" :style="{ top: 'calc(var(--app-header-height) + 1.5rem)' }">
            <slot name="nav" />
          </div>
        </aside>
        <div class="w-150 max-w-full min-w-0">
          <slot />
        </div>
        <CommunitySidebar follow footer>
          <slot name="sidebar" />
        </CommunitySidebar>
      </div>
    </div>
  </div>
</template>
