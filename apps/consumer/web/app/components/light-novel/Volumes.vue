<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  const props = defineProps<{
    volumes: LightNovelPageData['volumes']
    progress: LightNovelPageData['progress']
  }>()

  const progressMap = computed(
    () => new Map((props.progress?.progresses ?? []).map(item => [item.volume_id, item])),
  )
  const tracked = computed(() => props.progress != null)
</script>

<template>
  <section v-if="volumes.length" id="volumes" class="scroll-mt-24">
    <header class="mb-4 flex items-center gap-2.5">
      <h2 class="text-xl font-semibold text-surface-950 dark:text-surface-0">分卷</h2>
      <span class="text-sm text-surface-500 dark:text-surface-400">
        全 {{ volumes.length }} 卷 · 在线阅读
      </span>
    </header>
    <div class="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      <LightNovelVolumeItem
        v-for="volume in volumes"
        :key="volume.id"
        :volume="volume"
        :progress="progressMap.get(volume.id) ?? null"
        :tracked="tracked"
      />
    </div>
  </section>
</template>
