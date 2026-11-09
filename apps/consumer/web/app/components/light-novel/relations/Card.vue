<script setup lang="ts">
  import { Card, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { getNovelRelationLabel } from '~/labels/work'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelRelationsCard' })
  const props = defineProps<{ item: LightNovelPageData['relations'][number] }>()

  const target = computed(() => props.item.target_light_novel)
  const title = computed(() => target.value.name_cn || target.value.name)
  const line = computed(() =>
    [target.value.name_cn ? target.value.name : null, target.value.publication_date?.slice(0, 4)]
      .filter(Boolean)
      .join('　'),
  )
</script>

<template>
  <Card :padded="false" class="hn-state-layer w-full hn-interactive sm:w-80">
    <Inline gap="md" align="center" :wrap="false" class="p-3">
      <EntryBookCover :media="topVotedMedia(target.covers)" :alt="title" class="w-14 shrink-0" />
      <Stack gap="xs" class="min-w-0">
        <Tag tone="accent" class="self-start">{{ getNovelRelationLabel(item.relation) }}</Tag>
        <Stack gap="none" class="min-w-0">
          <Link
            :as="NuxtLink"
            :to="`/light-novels/${target.id}`"
            tone="neutral"
            :underline="false"
            class="truncate font-medium after:absolute after:inset-0"
          >
            {{ title }}
          </Link>
          <Text v-if="line" size="sm" tone="muted" truncate lang="ja">{{ line }}</Text>
        </Stack>
      </Stack>
    </Inline>
  </Card>
</template>
