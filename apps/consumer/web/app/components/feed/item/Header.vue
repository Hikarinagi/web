<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, Flex, IconButton, Inline, Tag, Time } from '@hina-ui/vue'
  import { Ellipsis, Flag, Pencil, Pin } from '@lucide/vue'
  import type { Component } from 'vue'
  import type { BackendFeedItem } from '~/features/feed/feed'
  import { usePostOwnerActions } from '~/features/post/usePostOwnerActions'
  import { useArticleOwnerActions } from '~/features/article/useArticleOwnerActions'

  const props = defineProps<{ item: BackendFeedItem; hideName?: boolean }>()
  interface MoreItem {
    label: string
    iconComponent: Component
    danger?: boolean
    loginRequired?: boolean
    action: () => void
  }

  const auth = useAuthStore()
  const { requireLogin } = useAuthGate()
  const ownerActions = usePostOwnerActions()
  const articleActions = useArticleOwnerActions()

  const isPinned = computed(
    () => (props.item.type === 'post' || props.item.type === 'article') && props.item.pinned,
  )
  const reportVisible = ref(false)

  const owned = computed(() => {
    const me = auth.user?.id
    if (me == null) return null
    const it = props.item
    return (it.type === 'post' || it.type === 'article') && it.author?.id === me ? it : null
  })

  const items = computed<MoreItem[]>(() => {
    const own = owned.value
    if (own?.type === 'post' || own?.type === 'article') {
      const id = own.id
      const run = own.type === 'post' ? () => ownerActions.edit(id) : () => articleActions.edit(id)
      return [{ label: '编辑', iconComponent: Pencil, action: run }]
    }
    return [
      { label: '举报', iconComponent: Flag, danger: true, loginRequired: true, action: report },
    ]
  })

  function report() {
    reportVisible.value = true
  }
</script>

<template>
  <Inline gap="sm" align="start" class="min-w-0 text-sm">
    <Tag v-if="isPinned" size="sm" class="shrink-0">
      <Pin class="size-3" />
      置顶
    </Tag>

    <Flex
      v-if="!hideName"
      direction="col"
      gap="none"
      class="min-w-0 flex-1 gap-0.5 sm:flex-row sm:items-center sm:gap-2"
    >
      <Inline gap="sm" class="min-w-0">
        <UserName :user="item.author" class="min-w-0 font-semibold text-fg" />
        <UserBadges :user="item.author" />
        <Time
          v-if="!isPinned"
          :value="item.sort_time"
          format="relative"
          class="shrink-0 text-muted sm:hidden"
        />
      </Inline>

      <Time
        v-if="!isPinned"
        :value="item.sort_time"
        format="relative"
        class="hidden shrink-0 text-muted sm:inline"
      />
    </Flex>

    <Inline v-else gap="xs" class="min-w-0 flex-1 text-muted">
      <Time v-if="!isPinned" :value="item.sort_time" format="relative" class="shrink-0" />
    </Inline>
    <DropdownMenu label="动态操作" align="end">
      <IconButton
        label="更多"
        :tooltip="false"
        size="sm"
        aria-haspopup="menu"
        class="relative z-1 size-6"
      >
        <Ellipsis />
      </IconButton>

      <template #content>
        <DropdownMenuItem
          v-for="option in items"
          :key="option.label"
          :tone="option.danger ? 'danger' : undefined"
          @select="option.loginRequired && !requireLogin() ? undefined : option.action()"
        >
          <template #icon>
            <component :is="option.iconComponent" />
          </template>
          {{ option.label }}
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
    <FeedItemReport v-model:visible="reportVisible" :item="item" />
  </Inline>
</template>
