<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { BookCheck, PenLine } from '@lucide/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeHeroClaim' })
  const props = defineProps<{
    volumeId: number
    provider: LightNovelVolumePageData['volume']['epub_provider']
  }>()

  type Claim = ApiData<'/api/v3/novel-projects', 'get'>['items'][number]

  const COPY = {
    TRANSLATION: { active: '正在翻译该卷', review: '对该卷的翻译正在接受审核', done: '翻译' },
    ENTRY: { active: '正在录入该卷', review: '对该卷的录入正在接受审核', done: '录入' },
  }

  const { data } = useHikariApiData('/api/v3/novel-projects', {
    query: {
      light_novel_volume_id: props.volumeId,
      status: ['DRAFT', 'ACTIVE', 'REVIEW', 'PUBLISHED'],
      page: 1,
      page_size: 4,
    },
    lazy: true,
    server: false,
    toast: false,
  })

  function describe(claim: Claim) {
    const copy = COPY[claim.mode]
    if (claim.status === 'REVIEW') return `${copy.review}。`
    if (claim.mode !== 'TRANSLATION' || !claim.progress.segments) return `${copy.active}。`
    const percent = Math.floor((claim.progress.done * 100) / claim.progress.segments)
    return `${copy.active}，已完成 ${percent}%。`
  }
</script>

<template>
  <Stack v-if="provider || data?.items.length" gap="xs" class="items-center lg:items-start">
    <Inline v-if="provider" gap="xs" align="center" :wrap="false">
      <BookCheck class="size-4 shrink-0 text-muted" aria-hidden="true" />
      <Text size="sm" tone="muted">
        由 <UserName :user="provider" :handle="false" class="inline-flex" /> 上传。
      </Text>
    </Inline>
    <Inline v-for="claim in data?.items" :key="claim.id" gap="xs" align="center" :wrap="false">
      <BookCheck
        v-if="claim.status === 'PUBLISHED'"
        class="size-4 shrink-0 text-muted"
        aria-hidden="true"
      />
      <PenLine v-else class="size-4 shrink-0 text-muted" aria-hidden="true" />
      <Text v-if="claim.status === 'PUBLISHED'" size="sm" tone="muted">
        由 <UserName :user="claim.owner" :handle="false" class="inline-flex" />
        {{ COPY[claim.mode].done }}。
      </Text>
      <Text v-else size="sm" tone="muted">
        <UserName :user="claim.owner" :handle="false" class="inline-flex" />
        {{ describe(claim) }}
      </Text>
    </Inline>
  </Stack>
</template>
