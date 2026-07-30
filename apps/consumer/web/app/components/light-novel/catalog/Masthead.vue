<script setup lang="ts">
  import type { CatalogMasthead } from '~/features/light-novel/catalog'

  defineOptions({ name: 'LightNovelCatalogMasthead' })
  const props = defineProps<{ masthead: CatalogMasthead; total: number }>()

  const metaLine = computed(() =>
    [`${props.total.toLocaleString()} 部作品`, ...props.masthead.meta].join('  ·  '),
  )
</script>

<template>
  <section
    class="relative overflow-hidden border-b border-surface-200 bg-linear-to-r from-surface-0 via-surface-0 to-hikari-primary-100/50 dark:border-surface-800 dark:from-surface-950 dark:via-surface-950 dark:to-surface-900"
  >
    <div
      class="mx-auto box-content flex max-w-app items-center gap-5 px-6 pt-[calc(var(--app-header-height)+1.75rem)] pb-7"
    >
      <HikariImage
        v-if="masthead.image"
        :src="masthead.image.src"
        :alt="masthead.name"
        class="size-16 shrink-0 border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
        :class="masthead.shape === 'circle' ? 'rounded-full' : 'rounded-xl'"
        :image-class="
          masthead.shape === 'circle' ? 'object-cover object-top' : 'object-contain p-1.5'
        "
        preset="thumbnail"
      />
      <div class="flex min-w-0 flex-col gap-1">
        <p class="text-xs font-semibold tracking-wide text-hikari-primary-600">
          {{ masthead.eyebrow }}
        </p>
        <div class="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <h1 class="text-[28px] leading-tight font-bold text-surface-950 dark:text-white">
            {{ masthead.name }}
          </h1>
          <span v-if="masthead.sub" class="truncate text-sm text-surface-500 dark:text-surface-400">
            {{ masthead.sub }}
          </span>
        </div>
        <p class="text-[13px] text-surface-500 dark:text-surface-400">
          {{ metaLine }}
          <template v-if="masthead.website">
            ·
            <a
              :href="masthead.website"
              target="_blank"
              rel="noopener noreferrer"
              class="text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
            >
              官网 ↗
            </a>
          </template>
        </p>
      </div>
    </div>
  </section>
</template>
