<script setup lang="ts">
  import type { WorkCardItem } from '~/features/entity/entity'

  defineOptions({ name: 'EntityWorkCard' })
  defineProps<{ item: WorkCardItem }>()
</script>

<template>
  <div class="group relative flex min-w-0 flex-col gap-2">
    <div
      class="relative overflow-hidden rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
      :class="
        item.aspect === 'light_novel'
          ? 'aspect-7/10'
          : item.aspect === 'manga'
            ? 'aspect-2/3'
            : 'aspect-3/4'
      "
    >
      <HikariImage
        :src="item.cover"
        :alt="item.title"
        class="size-full"
        image-class="object-cover object-top"
        :processing="{ quality: 82 }"
      />
      <span
        v-if="item.rolePill"
        class="absolute top-1.5 left-1.5 max-w-[calc(100%-0.75rem)] truncate rounded bg-surface-900/75 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
      >
        {{ item.rolePill }}
      </span>
    </div>
    <div class="flex flex-col gap-0.5">
      <NuxtLink
        :to="item.to"
        class="truncate text-sm font-medium text-surface-900 transition-colors group-hover:text-hikari-primary-600 after:absolute after:inset-0 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
      >
        {{ item.title }}
      </NuxtLink>
      <p
        v-if="item.cv?.length"
        class="relative z-10 truncate text-xs text-surface-500 dark:text-surface-400"
      >
        <template v-for="(actor, index) in item.cv" :key="actor.id">
          <span v-if="index" aria-hidden="true" class="px-1">/</span>
          <NuxtLink
            :to="`/people/${actor.id}`"
            class="transition-colors hover:text-hikari-primary-600 hover:underline dark:hover:text-hikari-primary-400"
          >
            {{ actor.name }}
          </NuxtLink>
        </template>
      </p>
      <p v-else-if="item.subtitle" class="truncate text-xs text-surface-500 dark:text-surface-400">
        {{ item.subtitle }}
      </p>
      <p v-else-if="item.year" class="text-xs text-surface-500 dark:text-surface-400">
        {{ item.year }}
      </p>
    </div>
  </div>
</template>
