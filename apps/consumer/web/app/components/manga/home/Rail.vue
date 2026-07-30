<script setup lang="ts">
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'

  defineOptions({ name: 'MangaHomeRail' })
  defineProps<{
    title: string
    meta?: string
    to?: string
    items: MangaHomePageData['updates']['items'][number][]
    ranked?: boolean
    hideStatus?: boolean
  }>()
</script>

<template>
  <MangaHomeSection v-if="items.length" :title="title" :meta="meta" :to="to">
    <ScrollArea axis="x" shadow="end" arrows class="-mx-6">
      <div class="flex min-w-max gap-4 px-6 pb-2">
        <MangaHomeCard
          v-for="(item, index) in items"
          :key="item.id"
          :item="item"
          :rank="ranked ? index + 1 : undefined"
          :hide-status="hideStatus"
          class="w-[150px]"
        />
      </div>
    </ScrollArea>
  </MangaHomeSection>
</template>
