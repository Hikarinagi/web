<script setup lang="ts">
  import {
    Card,
    Grid,
    IconButton,
    Inline,
    Link,
    Progress,
    SegmentedControl,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tag,
    Text,
    VisuallyHidden,
  } from '@hina-ui/vue'
  import { ArrowDownUp, BookOpen } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { dayText, monthText } from '~/features/entry/date'
  import { TRANSLATION_QUALITY_LABEL } from '~/features/workbench/labels'
  import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  type Volume = LightNovelPageData['volumes'][number]

  defineOptions({ name: 'LightNovelShelf' })
  const props = defineProps<{
    volumes: Volume[]
    progress: LightNovelPageData['progress']
  }>()

  const VIEWS = [
    { value: 'grid', label: '封面' },
    { value: 'list', label: '列表' },
  ]
  const view = ref('grid')
  const desc = ref(false)
  const ordered = computed(() => (desc.value ? [...props.volumes].reverse() : props.volumes))
  const current = computed(() => props.progress?.continue_volume_id ?? null)
  const progressMap = computed(
    () => new Map((props.progress?.progresses ?? []).map(item => [item.volume_id, item])),
  )
  const percent = (volume: Volume) => {
    const entry = progressMap.value.get(volume.id)
    if (!entry) return 0
    return entry.finished ? 100 : Math.min(100, Math.max(0, entry.percentage))
  }
  const label = (volume: Volume) =>
    getLightNovelVolumeLabel(volume) ?? getLightNovelVolumeTitle(volume)
  const readLabel = (volume: Volume) => {
    const base = volume.online_reading_is_collection ? 'EPUB 合集' : 'EPUB'
    const quality = volume.online_reading_translation
    return `阅读 ${quality ? `${base} ${TRANSLATION_QUALITY_LABEL[quality]}` : base}`
  }
  const read = (volume: Volume) =>
    navigateTo(`/light-novel-volumes/${volume.id}/read`, { open: { target: '_blank' } })
</script>

<template>
  <EntrySectionHead id="shelf" title="书架" :count="volumes.length">
    <template #actions>
      <Inline gap="xs" align="center" :wrap="false">
        <IconButton
          :label="desc ? '按卷次正序' : '按卷次倒序'"
          size="sm"
          variant="ghost"
          tone="neutral"
          @click="desc = !desc"
        >
          <ArrowDownUp />
        </IconButton>
        <SegmentedControl v-model="view" :options="VIEWS" size="sm" aria-label="书架的显示方式" />
      </Inline>
    </template>
  </EntrySectionHead>

  <Grid
    v-if="view === 'grid'"
    :cols="3"
    gap="none"
    class="gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6"
  >
    <Stack
      v-for="volume in ordered"
      :key="volume.id"
      gap="sm"
      :class="volume.online_reading_available ? undefined : 'opacity-50'"
    >
      <NuxtLink
        :to="`/light-novel-volumes/${volume.id}`"
        class="relative block hn-interactive rounded-md"
        :aria-label="label(volume)"
      >
        <EntryBookCover
          :media="volume.display_cover"
          :alt="`${label(volume)}封面`"
          :class="
            current === volume.id
              ? 'ring-2 ring-accent ring-offset-2 ring-offset-(--hn-bg-canvas)'
              : undefined
          "
        />
        <Tag
          v-if="current === volume.id"
          tone="accent"
          variant="solid"
          class="absolute top-2 left-3"
        >
          在读
        </Tag>
        <Progress
          v-if="percent(volume) > 0"
          :value="percent(volume)"
          size="sm"
          :tone="percent(volume) === 100 ? 'success' : 'accent'"
          class="absolute inset-x-0 bottom-0"
        />
      </NuxtLink>
      <Inline gap="xs" align="center" justify="between" :wrap="false">
        <Stack gap="none" class="min-w-0">
          <Text size="sm" weight="medium" truncate class="tabular-nums">{{ label(volume) }}</Text>
          <Text size="xs" tone="muted" class="tabular-nums">
            {{ monthText(volume.publication_date) }}
          </Text>
        </Stack>
        <IconButton
          v-if="volume.online_reading_available"
          :label="readLabel(volume)"
          size="sm"
          variant="ghost"
          tone="neutral"
          class="hidden sm:inline-flex"
          @click="read(volume)"
        >
          <BookOpen />
        </IconButton>
      </Inline>
    </Stack>
  </Grid>

  <Card v-else :padded="false">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>卷次</TableHead>
          <TableHead>书名</TableHead>
          <TableHead>发售日</TableHead>
          <TableHead align="end">页数</TableHead>
          <TableHead>ISBN</TableHead>
          <TableHead align="end"><VisuallyHidden>操作</VisuallyHidden></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="volume in ordered" :key="volume.id">
          <TableCell class="whitespace-nowrap tabular-nums">
            <Inline gap="sm" align="center" :wrap="false">
              {{ label(volume) }}
              <Tag v-if="current === volume.id" tone="accent">在读</Tag>
            </Inline>
          </TableCell>
          <TableCell class="max-w-xs">
            <Inline gap="sm" align="center" :wrap="false">
              <HikariImage
                v-if="volume.display_cover"
                :src="volume.display_cover"
                alt=""
                :ratio="7 / 10"
                preset="thumbnail"
                class="w-7 shrink-0 rounded-xs"
              />
              <Link
                :as="NuxtLink"
                :to="`/light-novel-volumes/${volume.id}`"
                tone="neutral"
                class="truncate"
                lang="ja"
              >
                {{ getLightNovelVolumeTitle(volume) }}
              </Link>
            </Inline>
          </TableCell>
          <TableCell class="whitespace-nowrap tabular-nums">
            {{ dayText(volume.publication_date) }}
          </TableCell>
          <TableCell align="end" class="tabular-nums">{{ volume.pages ?? '' }}</TableCell>
          <TableCell class="tabular-nums">{{ volume.isbn }}</TableCell>
          <TableCell align="end">
            <Button
              v-if="volume.online_reading_available"
              size="sm"
              variant="ghost"
              tone="neutral"
              @click="read(volume)"
            >
              阅读
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Card>
</template>
