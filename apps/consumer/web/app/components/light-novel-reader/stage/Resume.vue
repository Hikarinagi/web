<script setup lang="ts">
  import { Button, Card, Inline, Text } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderStageResume' })

  const { resume } = useReader()
  const { offer } = resume
</script>

<template>
  <Transition
    enter-active-class="hn-transition ease-(--hn-ease-enter)"
    leave-active-class="hn-transition ease-(--hn-ease-exit)"
    enter-from-class="translate-y-2 opacity-0"
    leave-to-class="translate-y-2 opacity-0"
  >
    <Card
      v-if="offer"
      role="dialog"
      aria-label="跨设备阅读位置"
      class="absolute inset-x-3 bottom-6 z-20 mx-auto max-w-lg shadow-lg"
    >
      <Inline align="center" gap="md" :wrap="false" class="w-full">
        <Text size="sm" class="min-w-0 flex-1">
          {{
            offer.chapter
              ? `你在另一台设备上已读到${offer.chapter}，是否跳转？`
              : '你在另一台设备上的阅读位置更靠后，是否跳转？'
          }}
        </Text>
        <Button variant="ghost" tone="neutral" size="sm" class="shrink-0" @click="resume.ignore()">
          忽略
        </Button>
        <Button size="sm" class="shrink-0" @click="resume.accept()">跳转</Button>
      </Inline>
    </Card>
  </Transition>
</template>
