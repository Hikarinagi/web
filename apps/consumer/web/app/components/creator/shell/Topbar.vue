<script setup lang="ts">
  import { Button, Heading, Inline, SidebarTrigger, Text } from '@hina-ui/vue'
  import { House } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { useScroll } from '@vueuse/core'

  defineOptions({ name: 'CreatorShellTopbar' })

  const props = withDefaults(defineProps<{ viewport?: HTMLElement | null }>(), { viewport: null })

  const route = useRoute()
  const title = computed(() => (route.meta.title as string | undefined) ?? '创作者中心')

  const { subtitle } = useCreatorTopbar()
  const { y } = useScroll(() => props.viewport)
  const showSubtitle = computed(() => !!subtitle.value && y.value > 32)
</script>

<template>
  <SidebarTrigger />

  <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0 flex-1">
    <Heading :level="1" size="sm" class="shrink-0">{{ title }}</Heading>
    <Transition
      enter-active-class="hn-transition"
      leave-active-class="hn-transition"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <Inline v-if="showSubtitle" as="span" gap="sm" align="baseline" :wrap="false" class="min-w-0">
        <Text as="span" tone="faint" aria-hidden="true">/</Text>
        <Text as="span" size="sm" tone="muted" truncate>{{ subtitle }}</Text>
      </Inline>
    </Transition>
  </Inline>

  <Button :as="NuxtLink" to="/" variant="ghost" tone="neutral" size="sm" class="shrink-0">
    <template #icon><House aria-hidden="true" /></template>
    返回
  </Button>
  <ThemeToggle />
</template>
