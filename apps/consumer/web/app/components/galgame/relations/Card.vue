<script setup lang="ts">
  import { Card, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { relationLabel } from '~/features/galgame/labels'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameRelationsCard' })
  const props = defineProps<{ item: GalgamePageData['relations'][number] }>()

  const target = computed(() => props.item.target_galgame)
  const title = computed(() => target.value.trans_title || target.value.origin_title)
  const cover = computed(() => topVotedMedia(target.value.covers))
  const line = computed(() =>
    [
      target.value.trans_title ? target.value.origin_title : null,
      target.value.release_date?.slice(0, 4),
    ]
      .filter(Boolean)
      .join('　'),
  )
</script>

<template>
  <Card :padded="false" class="hn-state-layer w-full hn-interactive sm:w-80">
    <Inline gap="md" align="center" :wrap="false" class="p-2">
      <HikariImage
        :src="cover"
        :alt="title"
        :ratio="2 / 3"
        preset="thumbnail"
        class="w-16 shrink-0 rounded-md"
      />
      <Stack gap="xs" class="min-w-0">
        <Tag tone="accent" class="self-start">{{ relationLabel(item.relation) }}</Tag>
        <Stack gap="none" class="min-w-0">
          <Link
            :as="NuxtLink"
            :to="`/galgames/${target.id}`"
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
