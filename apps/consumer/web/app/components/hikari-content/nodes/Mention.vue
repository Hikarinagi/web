<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../composables/useContentSummaries'

  defineOptions({ name: 'HikariContentNodesMention' })

  const props = defineProps<{ node: EditorNode }>()

  const summaries = useContentSummaries()

  const userId = computed(() => {
    const id = props.node.attrs?.mention_user_id
    return typeof id === 'number' && id > 0 ? id : null
  })
  const summary = computed(() =>
    userId.value !== null ? (summaries.value.mention_users.get(userId.value) ?? null) : null,
  )
  const displayName = computed(
    () => summary.value?.name ?? (userId.value ? `user_${userId.value}` : 'unknown'),
  )
  const avatarSrc = computed(() => summary.value?.avatar?.src ?? null)
</script>

<template>
  <span
    class="inline-flex align-middle"
    data-card-type="mention_user"
    :data-mention-user-id="userId ?? ''"
  >
    <UserCardTrigger v-if="userId" :user-id="userId" show-on-click>
      <span
        :class="[
          'inline-flex h-[22px] cursor-pointer items-center gap-1 rounded-full pr-2 text-sm leading-none font-medium transition-[background] duration-120 ease-out',
          avatarSrc ? 'pl-[3px]' : 'pl-2',
          'bg-hikari-primary-50 text-hikari-primary-700 hover:bg-hikari-primary-100 active:bg-hikari-primary-200',
          'dark:bg-hikari-primary-950 dark:text-hikari-primary-300 dark:hover:bg-hikari-primary-900 dark:active:bg-hikari-primary-800',
        ]"
      >
        <HikariImage
          v-if="avatarSrc"
          :src="avatarSrc"
          :alt="displayName"
          :processing="false"
          :skeleton="false"
          class="size-4 shrink-0 overflow-hidden rounded-full"
          image-class="size-full object-cover"
        >
          <template #empty><span /></template>
          <template #error><span /></template>
        </HikariImage>
        <span class="inline-flex items-center leading-none">@{{ displayName }}</span>
      </span>
    </UserCardTrigger>
    <span
      v-else
      class="inline-flex h-[22px] cursor-default items-center gap-1 rounded-full bg-(--editor-toolbar-item-hover) px-2 text-sm leading-none font-medium text-(--editor-text-muted)"
    >
      <span class="inline-flex items-center leading-none">@?</span>
    </span>
  </span>
</template>
