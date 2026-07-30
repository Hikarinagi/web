<script setup lang="ts">
  import { getNovelStatusLabel } from '#imports'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    bunko: { id: number; name: string } | null
  }>()
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2 lg:justify-start">
    <Tag
      :value="getNovelStatusLabel(lightNovel.novel_status)"
      class="border-0! bg-primary/10! px-2.5! py-1! text-sm! font-medium! text-primary!"
    />
    <NuxtLink v-if="bunko" :to="`/light-novels/bunko/${bunko.id}`">
      <Tag
        :value="bunko.name"
        severity="secondary"
        class="cursor-pointer px-2.5! py-1! text-sm! font-medium! transition-colors hover:bg-surface-200! dark:hover:bg-surface-700!"
      />
    </NuxtLink>
    <Tag
      v-if="lightNovel.nsfw"
      value="NSFW"
      severity="danger"
      class="px-2.5! py-1! text-sm! font-medium!"
    />
  </div>
</template>
