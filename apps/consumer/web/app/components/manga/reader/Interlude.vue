<script setup lang="ts">
  import { Button, Center, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { MangaReadingUnit } from '@hikarinagi/shared'

  defineOptions({ name: 'MangaReaderInterlude' })

  const props = defineProps<{
    mangaId: number
    mangaTitle: string
    unit: MangaReadingUnit
    noun: string
    label: string
    nextLabel: string | null
    nextLocked: boolean
    hasPrevious: boolean
    serializing: boolean
    continueChapters: boolean
    showMarkCta: boolean
    marking: boolean
  }>()

  const emit = defineEmits<{
    next: []
    previous: []
    continueChapters: []
    mark: []
  }>()

  const lastText = computed(() => {
    if (props.unit === 'volume') return '已是最后一卷'
    if (props.unit === 'extra') return '已是最后一篇番外'
    return props.serializing ? '已是最新一话' : '已是最后一话'
  })
</script>

<template>
  <Center class="h-full w-full px-6">
    <Stack align="center" gap="lg" class="w-full max-w-90 text-center">
      <Stack gap="xs">
        <Text size="sm" tone="muted">本{{ noun }}完</Text>
        <Heading :level="2" size="2xl">{{ label }}</Heading>
      </Stack>

      <Stack v-if="nextLabel && !nextLocked" gap="sm" class="w-full">
        <Button size="lg" block @click="emit('next')">下一{{ noun }} · {{ nextLabel }}</Button>
        <Text size="sm" tone="muted">翻页继续</Text>
      </Stack>
      <Stack v-else-if="nextLabel" gap="sm" class="w-full">
        <Button login-required size="lg" block>登录后阅读下一{{ noun }}</Button>
        <Text size="sm" tone="muted">{{ nextLabel }}</Text>
      </Stack>
      <Stack v-else gap="sm" class="w-full">
        <Text weight="medium">{{ lastText }}</Text>
        <Button v-if="continueChapters" size="lg" block @click="emit('continueChapters')">
          在单话中继续
        </Button>
      </Stack>

      <Button v-if="hasPrevious" variant="soft" tone="neutral" size="lg" @click="emit('previous')">
        上一{{ noun }}
      </Button>

      <Button
        v-if="showMarkCta"
        variant="ghost"
        tone="neutral"
        size="sm"
        :disabled="marking"
        @click="emit('mark')"
      >
        在看这部？标记一下，更新你的状态
      </Button>

      <Inline justify="center" :wrap="false">
        <FavoriteToggle
          :id="mangaId"
          type="manga"
          variant="bar"
          pill
          :picker-title="`将「${mangaTitle}」添加到收藏夹`"
        />
        <ShareButton :to="`/mangas/${mangaId}`" tooltip="分享" pill />
      </Inline>
    </Stack>
  </Center>
</template>
