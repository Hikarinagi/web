<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'

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

  useHead({ htmlAttrs: { class: props.lockOverscroll ? 'overscroll-y-none' : undefined } })
</script>

<template>
  <Stack gap="none" :class="cn('px-4 lg:px-6 lg:py-6', flush ? 'py-0' : 'py-4')">
    <Stack gap="none" align="center" class="mx-auto w-full max-w-7xl gap-6 px-0 lg:px-4">
      <slot name="top" />
      <Inline gap="none" align="stretch" justify="center" :wrap="false" class="w-full gap-8">
        <Stack as="aside" gap="none" class="hidden w-44 shrink-0 lg:block">
          <Stack gap="none" class="sticky top-[calc(var(--app-header-height)+1.5rem)]">
            <slot name="nav">
              <FeedTabs orientation="vertical" />
            </slot>
          </Stack>
        </Stack>
        <Stack gap="none" class="w-150 max-w-full min-w-0">
          <slot />
        </Stack>
        <CommunitySidebar :follow="follow" footer class="xl:block">
          <slot name="sidebar" />
        </CommunitySidebar>
      </Inline>
    </Stack>
  </Stack>
</template>
