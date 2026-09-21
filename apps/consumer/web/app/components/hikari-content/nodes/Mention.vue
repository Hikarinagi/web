<script setup lang="ts">
  import { Tag, VisuallyHidden } from '@hina-ui/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { cn } from '~/utils/cn'
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
      <Tag
        pill
        size="sm"
        :class="
          cn(
            'h-5.5 cursor-pointer text-sm leading-none transition-[background] duration-120 ease-out',
            avatarSrc ? 'ps-0.75 pe-2' : 'px-2',
            'bg-hikari-primary-50 text-hikari-primary-700 hover:bg-hikari-primary-100 active:bg-hikari-primary-200',
            'dark:bg-hikari-primary-950 dark:text-hikari-primary-300 dark:hover:bg-hikari-primary-900 dark:active:bg-hikari-primary-800',
          )
        "
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
          <template #empty><VisuallyHidden /></template>
          <template #error><VisuallyHidden /></template>
        </HikariImage>
        <span>@{{ displayName }}</span>
      </Tag>
    </UserCardTrigger>
    <Tag
      v-else
      pill
      size="sm"
      class="h-5.5 cursor-default bg-(--editor-toolbar-item-hover) px-2 text-sm leading-none text-(--editor-text-muted)"
      >@?</Tag
    >
  </span>
</template>
