<script setup lang="ts">
  import { Heading, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import type { CatalogMasthead } from '~/features/light-novel/catalog'

  defineOptions({ name: 'LightNovelCatalogMasthead' })
  const props = defineProps<{ masthead: CatalogMasthead; total: number }>()

  const metaLine = computed(() =>
    [`${props.total.toLocaleString()} 部作品`, ...props.masthead.meta].join('  ·  '),
  )
</script>

<template>
  <Stack
    as="section"
    gap="none"
    class="relative overflow-hidden border-b border-line bg-linear-to-r from-surface via-surface to-accent-soft"
  >
    <Stack gap="none" class="px-6 pt-[calc(var(--app-header-height)+1.75rem)] pb-7">
      <Inline gap="none" align="center" :wrap="false" class="mx-auto w-full max-w-app gap-5">
        <HikariImage
          v-if="masthead.image"
          :src="masthead.image.src"
          :alt="masthead.name"
          class="size-16 shrink-0 border border-line bg-surface"
          :class="masthead.shape === 'circle' ? 'rounded-full' : 'rounded-xl'"
          :image-class="
            masthead.shape === 'circle' ? 'object-cover object-top' : 'object-contain p-1.5'
          "
          preset="thumbnail"
        />

        <Stack gap="none" class="min-w-0 gap-1">
          <Text as="p" size="xs" weight="semibold" tone="accent" class="tracking-wide">
            {{ masthead.eyebrow }}
          </Text>

          <Inline gap="none" align="baseline" wrap class="min-w-0 gap-x-2.5 gap-y-0.5">
            <Heading :level="1" class="text-3xl leading-tight font-bold">
              {{ masthead.name }}
            </Heading>
            <Text v-if="masthead.sub" as="span" size="sm" tone="muted" truncate>
              {{ masthead.sub }}
            </Text>
          </Inline>

          <Text as="p" size="xs" tone="muted">
            {{ metaLine }}
            <template v-if="masthead.website">
              ·
              <Link :href="masthead.website" target="_blank" rel="noopener noreferrer">官网 ↗</Link>
            </template>
          </Text>
        </Stack>
      </Inline>
    </Stack>
  </Stack>
</template>
