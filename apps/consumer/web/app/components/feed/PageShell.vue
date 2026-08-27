<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      follow?: boolean
      lockOverscroll?: boolean
      /** Drop the phone-width vertical padding, for a page whose own top slot hugs the header. */
      flush?: boolean
    }>(),
    {
      follow: true,
      lockOverscroll: false,
      flush: false,
    },
  )

  useHead({ htmlAttrs: { class: props.lockOverscroll ? 'overscroll-none' : undefined } })
</script>

<template>
  <div class="px-4 sm:px-6 sm:py-6" :class="flush ? 'py-0' : 'py-4'">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-6 px-0 sm:px-4">
      <slot name="top" />
      <div class="flex w-full justify-center gap-8">
        <aside class="hidden w-44 shrink-0 xl:block">
          <div class="sticky" :style="{ top: 'calc(var(--app-header-height) + 1.5rem)' }">
            <slot name="nav">
              <FeedTabs orientation="vertical" />
            </slot>
          </div>
        </aside>
        <div class="w-150 max-w-full min-w-0">
          <slot />
        </div>
        <CommunitySidebar :follow="follow" footer>
          <slot name="sidebar" />
        </CommunitySidebar>
      </div>
    </div>
  </div>
</template>
