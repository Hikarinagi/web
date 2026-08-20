<script setup lang="ts">
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'

  defineOptions({ name: 'MangaHomeTags' })
  defineProps<{
    tags: MangaHomePageData['tags']
  }>()
</script>

<template>
  <MangaHomeSection v-if="tags.length" title="标签" meta="热门标签">
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="tag in tags"
        :key="tag.name"
        as="router-link"
        :to="`/mangas/browse?tag=${encodeURIComponent(tag.name)}`"
        :label="tag.name"
        severity="secondary"
        size="small"
      />
    </div>
  </MangaHomeSection>
</template>
