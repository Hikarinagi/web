<script setup lang="ts">
  import { ExternalLink } from '@lucide/vue'
  import { cn } from '~/utils/cn'

  const props = defineProps<{
    provider: 'bangumi' | 'vndb'
    href?: string | null
  }>()

  const providerMeta = computed(() => {
    if (props.provider === 'vndb') {
      return {
        label: 'VNDB',
        ariaLabel: '在 VNDB 查看',
        lineClass: 'via-sky-300/70',
        iconClass: 'text-sky-100/85',
        logoClass:
          "h-3 w-[30px] bg-[url('/assets/images/galgame/vndb-logo.svg')] bg-contain bg-center bg-no-repeat",
      }
    }

    return {
      label: 'Bangumi',
      ariaLabel: '在 Bangumi 查看',
      lineClass: 'via-rose-300/70',
      iconClass: 'text-rose-100/85',
      logoClass:
        "h-3.5 w-[54px] bg-[url('/assets/images/galgame/bangumi-logo.png')] bg-contain bg-center bg-no-repeat",
    }
  })
</script>

<template>
  <Button
    v-if="href"
    as="a"
    :unstyled="true"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="providerMeta.ariaLabel"
    class="relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-black/50 px-2.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(2,6,23,0.28)] backdrop-blur-sm transition-colors duration-200 hover:bg-black/60"
  >
    <span
      :class="
        cn(
          'absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent',
          providerMeta.lineClass,
        )
      "
    />
    <span :class="cn('block brightness-0 invert', providerMeta.logoClass)" aria-hidden="true" />
    <span class="text-sm font-normal">{{ providerMeta.label }}</span>
    <ExternalLink :size="14" :class="providerMeta.iconClass" aria-hidden="true" />
  </Button>
</template>
