<script setup lang="ts">
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'

  defineOptions({ name: 'MangasPage' })
  definePageMeta({ container: 'full' })

  const { data } = await useHikariApiData<MangaHomePageData>('/api/pages/mangas', { fatal: true })

  useHikariSeoMeta({
    title: '漫画',
    description: () =>
      '在线浏览漫画库，收录连载与完结漫画的作品信息、章节更新与连载杂志，找到你下一部想看的漫画。',
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <MangaHomeHeroBand :slides="data.hero.slides" />
    <div class="mx-auto box-content flex max-w-app flex-col gap-14 px-6 py-10">
      <MangaHomeTags :tags="data.tags" />
      <MangaHomeRail
        title="热门连载"
        to="/mangas/browse?status=serializing&sort=heat:desc"
        :items="data.hot"
        ranked
      />
      <MangaHomeUpdatesGrid
        title="新刊"
        meta="按发行时间排序"
        to="/mangas/browse"
        :items="data.updates.items"
      />
      <MangaHomeRankBoard :board="data.board" />
      <MangaHomeRail
        title="新作"
        meta="最近开始连载"
        to="/mangas/browse?sort=publication_date:desc"
        :items="data.fresh"
      />
      <MangaHomeRail
        v-if="data.magazine"
        :title="data.magazine.name"
        :meta="`${data.magazine.total} 部`"
        :to="`/mangas/browse?magazine_id=${data.magazine.id}`"
        :items="data.magazine.items"
      />
      <MangaHomeRail
        title="最新"
        to="/mangas/browse?status=finished&sort=publication_date:desc"
        :items="data.finished"
        hide-status
      />
      <MangaHomeCollectionCards :collections="data.collections" />
      <MangaHomeStream :cursor="data.updates.next_cursor" />
    </div>
  </div>
</template>
