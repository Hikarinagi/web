<script setup lang="ts">
  defineOptions({ name: 'FeedComposerTrigger' })

  const auth = useAuthStore()
  defineEmits<{ compose: [] }>()
</script>

<template>
  <div class="flex cursor-text items-center gap-3 px-4 py-4" @click="$emit('compose')">
    <Avatar :user="auth.user" shape="circle" class="size-9! shrink-0" />
    <p class="flex-1 text-[15px] leading-relaxed text-(--editor-placeholder-color)">
      分享你最近的想法、推荐、打卡
    </p>
    <div
      class="flex shrink-0 items-center gap-0.5 rounded-lg bg-surface-100 p-0.5 dark:bg-surface-800"
    >
      <span
        class="rounded-md bg-surface-0 px-3 py-1 text-xs font-bold text-color dark:bg-surface-900"
      >
        图文
      </span>
      <Button
        unstyled
        login-required
        class="cursor-pointer rounded-md px-3 py-1 text-xs font-medium text-muted-color transition-colors hover:text-color"
      >
        文章
      </Button>
    </div>
  </div>
</template>
