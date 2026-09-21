<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { workPath } from '#shared/utils/work'
  import type { PostPageData } from '~~/server/api/pages/posts/[id].get'

  type Work = PostPageData['post']['related_works'][number]

  defineOptions({ name: 'PostRelatedWorks' })
  const props = defineProps<{ works: Work[] }>()

  const to = (w: Work) => workPath(w.work_type, w.id)
  const { shouldBlockNsfw } = useNsfwPolicy()
  const visibleWorks = computed(() => props.works.filter(work => !shouldBlockNsfw(work.nsfw)))
</script>

<template>
  <Stack v-if="visibleWorks.length" gap="sm">
    <Text as="span" size="xs" tone="muted">提到了这些作品</Text>
    <Inline gap="sm">
      <Card
        v-for="w in visibleWorks"
        :key="`${w.work_type}:${w.id}`"
        :as="NuxtLink"
        :to="to(w)"
        :padded="false"
        class="hn-state-layer inline-flex hn-interactive items-center gap-2 py-1 ps-1 pe-3 shadow-none"
      >
        <Ripple />
        <HikariImage
          :src="w.cover"
          :alt="w.title"
          class="size-7 shrink-0 overflow-hidden rounded"
          image-class="size-full object-cover"
          :processing="{ q: 80 }"
        />
        <Text as="span" size="xs" weight="medium">{{ w.title }}</Text>
      </Card>
    </Inline>
  </Stack>
</template>
