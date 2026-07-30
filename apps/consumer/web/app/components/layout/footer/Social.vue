<script setup lang="ts">
  import BrandGithub from '~/components/brand/Github.vue'
  import BrandTelegram from '~/components/brand/Telegram.vue'
  import { FOOTER_SOCIAL, type FooterSocialIcon } from '~/config/site'

  const props = withDefaults(defineProps<{ size?: 'sm' | 'md' }>(), { size: 'md' })

  const iconMap = {
    telegram: BrandTelegram,
    github: BrandGithub,
  } satisfies Record<FooterSocialIcon, Component>

  const btnSize = computed(() => (props.size === 'sm' ? 'size-8' : 'size-9'))
  const iconSize = computed(() => (props.size === 'sm' ? 'size-4' : 'size-[18px]'))
</script>

<template>
  <div class="flex items-center gap-1">
    <Button
      v-for="item in FOOTER_SOCIAL"
      :key="item.label"
      v-tooltip.top="item.label"
      unstyled
      as="a"
      :href="item.href"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="item.label"
      :class="[
        btnSize,
        'inline-flex items-center justify-center rounded-full text-muted-color transition-colors duration-200 hover:bg-emphasis hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:outline-none',
      ]"
    >
      <component :is="iconMap[item.icon]" :class="iconSize" />
    </Button>
  </div>
</template>
