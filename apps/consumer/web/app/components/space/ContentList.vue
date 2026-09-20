<script setup lang="ts">
  import { Eye, FileText, ThumbsUp } from '@lucide/vue'
  import { contentPath, type SpaceContent } from '~/features/space/space'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineOptions({ name: 'SpaceContentList' })

  defineProps<{ items: SpaceContent[]; emptyText: string }>()
</script>

<template>
  <div v-if="items.length" class="flex flex-col">
    <NuxtLink
      v-for="item in items"
      :key="`${item.content_type}:${item.id}`"
      :to="contentPath(item)"
      class="group flex gap-4 border-b border-surface-100 py-4 last:border-b-0 dark:border-surface-800/60"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <p
          class="line-clamp-2 text-base leading-snug font-semibold text-color transition-colors group-hover:text-primary"
        >
          {{ item.title }}
        </p>
        <p v-if="item.excerpt" class="line-clamp-2 text-sm leading-relaxed text-muted-color">
          {{ item.excerpt }}
        </p>
        <div class="mt-auto flex items-center gap-3.5 pt-1 text-xs text-muted-color">
          <span class="flex items-center gap-1">
            <Eye class="size-3.5" />
            {{ item.view_count }}
          </span>
          <span class="flex items-center gap-1">
            <ThumbsUp class="size-3.5" />
            {{ item.like_count }}
          </span>
          <span>{{ datePartFormat(item.created_at, TimeFormatEnum.M_D_CN) }}</span>
        </div>
      </div>
      <HikariImage
        v-if="item.cover"
        :src="item.cover.src"
        :alt="item.title"
        class="h-24 w-36 shrink-0 rounded-lg bg-surface-100 dark:bg-surface-800"
        image-class="size-full object-cover"
        :processing="{ width: 288, height: 192, fit: 'cover', quality: 80 }"
      />
    </NuxtLink>
  </div>
  <SpaceEmptyState v-else :icon="FileText" :text="emptyText" />
</template>
