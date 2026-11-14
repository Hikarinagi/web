<script setup lang="ts">
  import { Drawer, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { titleText } from '~/features/entry/labels'
  import { COVER_KIND_LABELS, langLabel } from '~/features/galgame/labels'
  import { platformLabel } from '~/features/galgame/platforms'
  import type { CoverVoteState, GalgameCover } from '~/features/galgame/useCoverVote'

  defineOptions({ name: 'GalgameCoverVoteDrawer' })

  const props = defineProps<{
    covers: GalgameCover[]
    products: GalgamePageData['products']
    state: CoverVoteState
    busy: boolean
    editPath: string
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ vote: [mediaId: number]; retract: [] }>()

  const groups = computed(() => {
    const tally = new Map(props.state.covers.map(cover => [cover.media_id, cover.votes]))
    const releases = new Map(props.products.map(product => [product.id, product]))
    const found = new Map<number, GalgameCover[]>()
    for (const cover of props.covers)
      found.set(cover.product_id, [...(found.get(cover.product_id) ?? []), cover])
    return [...found].map(([id, covers]) => {
      const release = releases.get(id)
      return {
        id,
        title: titleText(release?.title),
        details: [
          release?.release?.text,
          release?.platforms.map(platformLabel).join('、'),
          release?.languages.map(langLabel).join('、'),
        ]
          .filter(Boolean)
          .join('　'),
        covers: covers.map(cover => ({
          media: cover.media,
          ratio:
            cover.media.width && cover.media.height
              ? cover.media.width / cover.media.height
              : 2 / 3,
          votes: tally.get(cover.media.id) ?? cover.votes,
          mine: props.state.my_media_id === cover.media.id,
          shown: props.state.shown_media_id === cover.media.id,
          kind: cover.kind ? COVER_KIND_LABELS[cover.kind] : '',
          language:
            cover.language && (release?.languages.length ?? 0) > 1 ? langLabel(cover.language) : '',
        })),
      }
    })
  })

  function pick(mine: boolean, mediaId: number) {
    if (props.busy) return
    if (mine) emit('retract')
    else emit('vote', mediaId)
  }
</script>

<template>
  <Drawer v-model:open="visible" title="封面投票" size="lg" :locked="busy">
    <template #content>
      <Stack gap="lg">
        <Stack v-for="group in groups" :key="group.id" gap="sm">
          <Stack gap="none">
            <Text weight="medium" lang="ja">{{ group.title }}</Text>
            <Text v-if="group.details" size="xs" tone="muted">{{ group.details }}</Text>
          </Stack>
          <Inline
            v-for="cover in group.covers"
            :key="cover.media.id"
            gap="md"
            align="center"
            :wrap="false"
          >
            <HikariImage
              :src="cover.media"
              :ratio="cover.ratio"
              preview
              alt="候选封面"
              class="w-28 shrink-0 overflow-hidden rounded-md bg-subtle"
              :processing="{ width: 320, quality: 88, fit: 'scale-down' }"
            />
            <Stack gap="sm" class="min-w-0 flex-1">
              <Inline v-if="cover.shown || cover.kind || cover.language" gap="xs">
                <Tag v-if="cover.shown" tone="accent">当前封面</Tag>
                <Tag v-if="cover.kind" variant="outline" tone="neutral">{{ cover.kind }}</Tag>
                <Tag v-if="cover.language" variant="outline" tone="neutral">
                  {{ cover.language }}
                </Tag>
              </Inline>
              <Text
                size="sm"
                :tone="cover.mine ? 'accent' : 'muted'"
                :weight="cover.mine ? 'medium' : 'normal'"
                class="tabular-nums"
              >
                {{ cover.votes }} 票
              </Text>
            </Stack>
            <Button
              login-required
              :variant="cover.mine ? 'soft' : 'outline'"
              :tone="cover.mine ? 'accent' : 'neutral'"
              :disabled="busy"
              class="shrink-0"
              @click="pick(cover.mine, cover.media.id)"
            >
              {{ cover.mine ? '已投' : '投这张' }}
            </Button>
          </Inline>
        </Stack>
      </Stack>
    </template>

    <template #footer>
      <Inline align="center" gap="xs" justify="start" class="w-full">
        <Text size="sm" tone="muted">选择你认为最适合展示给大家的封面，你也可以</Text>
        <Button :as="NuxtLink" :to="editPath" target="_blank" variant="link" size="sm">
          添加新封面
        </Button>
      </Inline>
    </template>
  </Drawer>
</template>
