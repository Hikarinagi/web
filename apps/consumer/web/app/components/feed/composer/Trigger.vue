<script setup lang="ts">
  import { Inline, SegmentedControl, Text } from '@hina-ui/vue'
  import { COMPOSER_KIND_OPTIONS } from './composables/useComposer'

  defineOptions({ name: 'FeedComposerTrigger' })

  const auth = useAuthStore()
  defineEmits<{ compose: [] }>()
</script>

<template>
  <Inline gap="md" :wrap="false" class="cursor-text px-4 py-4" @click="$emit('compose')">
    <Avatar :user="auth.user" class="size-9! shrink-0" />
    <Text class="flex-1 text-base leading-relaxed text-(--editor-placeholder-color)">
      分享你最近的想法、推荐、打卡
    </Text>
    <SegmentedControl
      :options="COMPOSER_KIND_OPTIONS"
      size="sm"
      class="shrink-0"
      @click.stop="$emit('compose')"
    />
  </Inline>
</template>
