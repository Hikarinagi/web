<script setup lang="ts">
  import { Button, Dialog, Progress, Stack, Text } from '@hina-ui/vue'
  import { Play } from '@lucide/vue'

  defineOptions({ name: 'LightNovelHeroContinueDialog' })

  const props = defineProps<{
    workTitle: string
    volumeId: number
    volumeLabel: string
    chapterTitle: string | null
    percentage: number
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const pct = computed(() => Math.min(100, Math.max(0, props.percentage)))

  function confirm() {
    visible.value = false
    navigateTo(`/light-novel-volumes/${props.volumeId}/read`)
  }
</script>

<template>
  <Dialog v-model:open="visible" title="继续阅读" size="md">
    <template #content>
      <Stack gap="md">
        <Stack gap="none" class="min-w-0">
          <Text weight="semibold" truncate>{{ volumeLabel }}</Text>
          <Text size="sm" tone="muted" truncate>{{ workTitle }}</Text>
        </Stack>

        <Text v-if="chapterTitle" size="sm" tone="muted">
          上次读到 ·
          <Text as="span" size="sm" weight="medium">{{ chapterTitle }}</Text>
        </Text>

        <Progress :value="pct" show-value size="sm" />
      </Stack>
    </template>

    <template #footer="{ close }">
      <Button variant="ghost" tone="neutral" @click="close">取消</Button>
      <Button @click="confirm">
        <template #icon>
          <Play />
        </template>
        继续阅读
      </Button>
    </template>
  </Dialog>
</template>
