<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { Building, CalendarDays, Languages, MonitorSmartphone } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { stageLogo } from '~/features/galgame/logo'
  import { platformLabel } from '~/features/galgame/platforms'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'GalgameStageMeta' })
  const props = defineProps<{ data: GalgamePageData; languages: string[] }>()

  const brand = computed(() => props.data.display.brands[0] ?? null)
  const shown = computed(() => stageLogo(props.data.galgame.logos, props.data.galgame.origin_lang))
  const meta = computed(() => {
    const { display } = props.data
    return [
      { icon: CalendarDays, text: display.release?.text ?? '' },
      { icon: MonitorSmartphone, text: display.platforms.map(platformLabel).join('、') },
      { icon: Languages, text: props.languages.join('、') },
    ].filter(item => item.text)
  })
</script>

<template>
  <Stack gap="xs" class="sm:flex-row sm:flex-wrap sm:gap-x-5">
    <Inline
      v-if="brand && shown.logo"
      gap="sm"
      align="center"
      :wrap="false"
      :class="cn(shown.light ? 'flex' : 'hidden', shown.dark ? 'dark:flex' : 'dark:hidden')"
    >
      <Building class="size-4 shrink-0 text-muted" />
      <Link
        v-if="brand.producer_id"
        :as="NuxtLink"
        :to="`/producers/${brand.producer_id}`"
        tone="neutral"
        class="text-sm text-fg/90"
        lang="ja"
      >
        {{ brand.text }}
      </Link>
      <Text v-else size="sm" class="text-fg/90" lang="ja">{{ brand.text }}</Text>
    </Inline>
    <Inline v-for="item in meta" :key="item.text" gap="sm" align="center" :wrap="false">
      <component :is="item.icon" class="size-4 shrink-0 text-muted" />
      <Text size="sm" class="text-fg/90">{{ item.text }}</Text>
    </Inline>
  </Stack>
</template>
