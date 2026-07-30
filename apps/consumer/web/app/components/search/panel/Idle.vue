<script setup lang="ts">
  import { X } from '@lucide/vue'
  import type { useSearch } from '~/features/search/composables/useSearch'
  import { searchOptionId } from '~/features/search/search'

  defineProps<{ search: ReturnType<typeof useSearch> }>()
  const emit = defineEmits<{ pick: [string] }>()
</script>

<template>
  <div class="flex flex-col">
    <section v-if="search.recent.length" class="pb-1">
      <header class="flex items-center justify-between px-3 pt-2 pb-2">
        <span class="text-xs font-semibold text-muted-color">最近搜索</span>
        <Button
          unstyled
          class="text-xs text-muted-color hover:text-color"
          @click="search.clearRecent()"
        >
          清除
        </Button>
      </header>
      <div class="flex flex-wrap gap-2 px-3">
        <div v-for="kw in search.recent" :key="kw" class="group relative inline-flex">
          <Button
            unstyled
            class="max-w-44 truncate rounded-full border border-surface bg-surface-50 px-3 py-1 text-[13px] text-color hover:bg-emphasis dark:bg-surface-800/60"
            @click="emit('pick', kw)"
          >
            {{ kw }}
          </Button>
          <div
            class="absolute top-1 right-0 translate-x-1/2 -translate-y-1/2 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100"
          >
            <Button
              unstyled
              aria-label="移除"
              class="inline-flex size-[18px] items-center justify-center rounded-full border border-surface bg-surface-0 text-muted-color shadow-sm hover:text-color dark:bg-surface-800"
              @click.stop="search.removeRecent(kw)"
            >
              <X class="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="search.recent.length && search.trending.length"
      class="mx-3 my-1 border-t border-surface"
    />

    <section v-if="search.trending.length">
      <p class="px-3 pt-2 pb-1 text-xs font-semibold text-muted-color">大家都在搜</p>
      <Button
        v-for="(t, i) in search.trending"
        :id="searchOptionId(i)"
        :key="t.keyword"
        role="option"
        :aria-selected="i === search.activeIndex"
        unstyled
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left"
        :class="i === search.activeIndex ? 'bg-emphasis' : 'hover:bg-emphasis'"
        @click="emit('pick', t.keyword)"
      >
        <span
          class="w-4 shrink-0 text-center text-sm font-bold"
          :class="i < 3 ? 'text-primary' : 'text-muted-color'"
        >
          {{ i + 1 }}
        </span>
        <span class="truncate text-sm text-color">{{ t.keyword }}</span>
      </Button>
    </section>

    <p
      v-if="!search.recent.length && !search.trending.length"
      class="px-3 py-6 text-center text-sm text-muted-color"
    >
      输入作品 / 角色 / 人物名开始搜索
    </p>
  </div>
</template>
