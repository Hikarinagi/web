<script setup lang="ts">
  import { IconButton, Inline } from '@hina-ui/vue'
  import BrandGithub from '~/components/brand/Github.vue'
  import BrandTelegram from '~/components/brand/Telegram.vue'
  import { FOOTER_SOCIAL, type FooterSocialIcon } from '~/config/site'

  withDefaults(defineProps<{ size?: 'sm' | 'md' }>(), { size: 'md' })

  const iconMap = {
    telegram: BrandTelegram,
    github: BrandGithub,
  } satisfies Record<FooterSocialIcon, Component>
</script>

<template>
  <Inline gap="xs">
    <IconButton
      v-for="item in FOOTER_SOCIAL"
      :key="item.label"
      as="a"
      :href="item.href"
      target="_blank"
      rel="noopener noreferrer"
      :label="item.label"
      :size="size"
      pill
    >
      <component :is="iconMap[item.icon]" />
    </IconButton>
  </Inline>
</template>
