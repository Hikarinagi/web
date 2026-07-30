<script setup lang="ts">
  import type { ArticleReviewContext } from '~/components/article/editor/composables/useArticleEditor'

  defineOptions({ name: 'PageArticleNew' })
  definePageMeta({ layout: 'editor', middleware: 'auth', floatingToolbar: false })

  const route = useRoute()

  function num(value: unknown): number | null {
    const raw = Array.isArray(value) ? value[0] : value
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  function str(value: unknown): string | null {
    const raw = Array.isArray(value) ? value[0] : value
    return typeof raw === 'string' && raw ? raw : null
  }

  const reviewContext: ArticleReviewContext = {
    galgameRateId: num(route.query.galgame_rate_id),
    lightNovelRateId: num(route.query.light_novel_rate_id),
    workTitle: str(route.query.work_title),
  }
  const isReview = reviewContext.galgameRateId != null || reviewContext.lightNovelRateId != null

  useHikariSeoMeta({ title: isReview ? '写长评' : '写文章', appendSiteName: true })
</script>

<template>
  <ArticleEditorShell :article-id="null" :review-context="reviewContext" />
</template>
