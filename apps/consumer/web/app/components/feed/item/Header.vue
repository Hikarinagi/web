<script setup lang="ts">
  import { timeFromNow } from '#imports'
  import { Ellipsis, Flag, Pencil, Pin } from '@lucide/vue'
  import type Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import type { Component } from 'vue'
  import type { BackendFeedItem } from '~/features/feed/feed'
  import { feedTypeLabel } from '~/features/feed/feed'
  import { usePostOwnerActions } from '~/features/post/usePostOwnerActions'
  import { useArticleOwnerActions } from '~/features/article/useArticleOwnerActions'

  const props = defineProps<{ item: BackendFeedItem; hideName?: boolean }>()
  interface MoreItem extends MenuItem {
    iconComponent: Component
    danger?: boolean
    loginRequired?: boolean
    action: () => void
  }

  const auth = useAuthStore()
  const ownerActions = usePostOwnerActions()
  const articleActions = useArticleOwnerActions()

  const typeLabel = computed(() => feedTypeLabel(props.item))
  const isPinned = computed(
    () => (props.item.type === 'post' || props.item.type === 'article') && props.item.pinned,
  )
  const menu = ref<InstanceType<typeof Menu> | null>(null)
  const menuOpen = ref(false)
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
      return [
        {
          label: '编辑',
          iconComponent: Pencil,
          action: () => {
            menu.value?.hide()
            run()
          },
        },
      ]
    }
    return [
      { label: '举报', iconComponent: Flag, danger: true, loginRequired: true, action: report },
    ]
  })

  function toggle(event: MouseEvent) {
    menu.value?.toggle(event)
  }

  function report() {
    menu.value?.hide()
    reportVisible.value = true
  }
</script>

<template>
  <div class="flex min-w-0 items-start gap-2 text-sm">
    <Tag
      v-if="isPinned"
      value="置顶"
      severity="secondary"
      class="shrink-0"
      :pt="{ root: { class: 'text-xs!' } }"
    >
      <template #icon><Pin class="size-3" /></template>
    </Tag>
    <div v-if="!hideName" class="flex min-w-0 flex-1 flex-col gap-0.5">
      <UserName :user="item.author" :handle="false" class="min-w-0 font-semibold text-color" />
      <span v-if="!isPinned" class="shrink-0 text-muted-color">
        {{ timeFromNow(item.sort_time) }}
      </span>
    </div>

    <div v-else class="flex min-w-0 flex-1 items-center gap-1 text-muted-color">
      <span class="shrink-0">{{ typeLabel }}</span>
      <span v-if="!isPinned" class="shrink-0">·</span>
      <span v-if="!isPinned" class="shrink-0">{{ timeFromNow(item.sort_time) }}</span>
    </div>
    <Button
      unstyled
      aria-label="更多"
      aria-haspopup="menu"
      :aria-expanded="menuOpen"
      class="relative z-1 grid size-6 shrink-0 place-items-center rounded text-muted-color transition-colors hover:bg-surface-100 hover:text-color dark:hover:bg-surface-800"
      @click="toggle"
    >
      <Ellipsis class="size-3.5" />
    </Button>
    <Menu
      ref="menu"
      :model="items"
      popup
      aria-label="动态操作"
      :pt="{ list: { class: 'py-1!' } }"
      @show="menuOpen = true"
      @hide="menuOpen = false"
    >
      <template #item="{ item: option }">
        <Button
          unstyled
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          :class="option.danger ? 'text-red-500' : 'text-color'"
          :login-required="option.loginRequired"
          @click="option.action"
        >
          <component :is="option.iconComponent" class="size-4 shrink-0" />
          <span>{{ option.label }}</span>
        </Button>
      </template>
    </Menu>
    <FeedItemReport v-model:visible="reportVisible" :item="item" />
  </div>
</template>
