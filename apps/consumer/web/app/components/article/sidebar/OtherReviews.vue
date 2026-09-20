<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import { workPath } from '#shared/utils/work'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  type Group = ArticlePageData['other_reviews'][number]

  defineProps<{ groups: Group[] }>()

  const workTo = (w: Group['work']) => workPath(w.work_type, w.id)
</script>

<template>
  <ArticlePanel title="其它人写过这几部">
    <div class="flex flex-col">
      <div
        v-for="g in groups"
        :key="`${g.work.work_type}:${g.work.id}`"
        class="border-t border-surface-100 px-4 py-3 first:border-t-0 dark:border-surface-800/60"
      >
        <NuxtLink
          :to="workTo(g.work)"
          class="mb-2 block truncate text-[13px] font-semibold text-color transition-colors hover:text-primary"
        >
          {{ g.work.title }}
        </NuxtLink>
        <ul class="flex flex-col gap-2.5">
          <li v-for="r in g.reviews" :key="r.id" class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <Avatar :user="r.rater" card shape="circle" class="size-5! shrink-0" />
              <UserName :user="r.rater" class="min-w-0 text-xs font-medium text-color" />
              <span
                v-if="r.rate != null"
                class="ml-auto inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-amber-500"
              >
                <Star class="size-3 fill-amber-400 text-amber-400" />
                {{ r.rate.toFixed(1) }}
              </span>
            </div>
            <p
              class="text-xs leading-relaxed text-muted-color"
              :class="{ 'line-clamp-2': !r.is_spoiler }"
            >
              <Spoiler v-if="r.is_spoiler" class="line-clamp-2">{{ r.rate_content }}</Spoiler>
              <template v-else>{{ r.rate_content }}</template>
            </p>
          </li>
        </ul>
      </div>
    </div>
  </ArticlePanel>
</template>
