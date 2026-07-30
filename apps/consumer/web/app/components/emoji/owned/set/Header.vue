<script setup lang="ts">
  defineOptions({ name: 'EmojiOwnedSetHeader' })

  defineProps<{
    name: string
    visibilityPublic: boolean
    emojiCount: number
    subscriberCount: number
  }>()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-1">
    <div class="flex items-center gap-2">
      <span class="truncate font-mono text-sm font-semibold">{{ name }}</span>
      <Tag
        :value="visibilityPublic ? '公开' : '私有'"
        :severity="visibilityPublic ? 'success' : 'secondary'"
        :pt="{ root: { class: 'text-[10px]!' } }"
      />
    </div>
    <p class="text-xs text-muted-color">{{ emojiCount }} 个贴纸 · {{ subscriberCount }} 人订阅</p>
  </div>
</template>
