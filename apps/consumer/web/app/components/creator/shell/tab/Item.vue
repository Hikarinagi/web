<script setup lang="ts">
  import {
    CloseButton,
    ContextMenu,
    ContextMenuItem,
    ContextMenuSeparator,
    Indicator,
    Inline,
    Kbd,
    Text,
  } from '@hina-ui/vue'
  import { Link2, Pin, PinOff } from '@lucide/vue'
  import { tabIcon } from '~/features/creator/tab-icons'
  import type { CreatorTab } from '~/features/creator/tabs'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'CreatorShellTabItem' })

  const props = defineProps<{ tab: CreatorTab; index: number }>()
  const store = useCreatorTabsStore()
  const actions = useCreatorTabActions()

  const current = computed(() => actions.active.value === props.tab.key)
  const icon = computed(() => tabIcon(props.tab))
  const keys = (list: CreatorTab[]) => list.map(item => item.key)
  const others = computed(() => keys(store.tabs.filter(item => item.key !== props.tab.key)))
  const left = computed(() => keys(store.tabs.slice(0, props.index)))
  const right = computed(() => keys(store.tabs.slice(props.index + 1)))
  const clean = computed(() => keys(store.tabs.filter(item => !actions.dirty(item.key))))

  function auxclick(event: MouseEvent) {
    if (event.button !== 1) return
    event.preventDefault()
    if (!props.tab.pinned) actions.close(props.tab.key)
  }
</script>

<template>
  <Inline
    data-creator-tab
    :data-tab-key="tab.key"
    :data-pinned="tab.pinned ? 'true' : 'false'"
    gap="none"
    align="stretch"
    :wrap="false"
    :class="
      cn(
        'h-full shrink-0 border-b-2 transition-colors',
        current ? 'border-accent' : 'border-transparent hover:bg-subtle',
      )
    "
    @mousedown.middle.prevent
    @auxclick="auxclick"
  >
    <ContextMenu :label="`${tab.title}的操作`" class="h-full">
      <Inline gap="none" align="center" :wrap="false" class="h-full max-w-60 pe-1">
        <NuxtLink
          v-tooltip="tab.title"
          :to="tab.path"
          role="tab"
          :aria-selected="current"
          draggable="false"
          class="flex h-full min-w-0 items-center gap-2 ps-3 pe-1 outline-none focus-visible:bg-subtle"
        >
          <component
            :is="icon"
            :class="cn('size-4 shrink-0', current ? 'text-accent-text' : 'text-muted')"
            aria-hidden="true"
          />
          <Text
            as="span"
            size="sm"
            :tone="current ? undefined : 'muted'"
            :weight="current ? 'medium' : undefined"
            truncate
          >
            {{ tab.title }}
          </Text>
          <Indicator v-if="actions.dirty(tab.key)" tone="accent" size="sm" label="有未保存的修改" />
        </NuxtLink>
        <Pin
          v-if="tab.pinned"
          class="mx-1 size-3.5 shrink-0 text-faint"
          aria-label="已固定"
          role="img"
        />
        <CloseButton
          v-else
          size="xs"
          :label="`关闭「${tab.title}」`"
          @click="actions.close(tab.key)"
        />
      </Inline>
      <template #content>
        <ContextMenuItem :disabled="tab.pinned" @select="actions.close(tab.key)">
          关闭
          <template v-if="current" #trailing><Kbd>Alt</Kbd> <Kbd>W</Kbd></template>
        </ContextMenuItem>
        <ContextMenuItem :disabled="!others.length" @select="actions.closeMany(others)">
          关闭其他标签页
        </ContextMenuItem>
        <ContextMenuItem :disabled="!left.length" @select="actions.closeMany(left)">
          关闭左侧的标签页
        </ContextMenuItem>
        <ContextMenuItem :disabled="!right.length" @select="actions.closeMany(right)">
          关闭右侧的标签页
        </ContextMenuItem>
        <ContextMenuItem :disabled="!clean.length" @select="actions.closeMany(clean)">
          关闭没有修改的标签页
        </ContextMenuItem>
        <ContextMenuItem @select="actions.closeMany(keys(store.tabs))">
          关闭全部标签页
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem @select="actions.pin(tab.key, !tab.pinned)">
          <template #icon><PinOff v-if="tab.pinned" /><Pin v-else /></template>
          {{ tab.pinned ? '取消固定' : '固定' }}
        </ContextMenuItem>
        <ContextMenuItem @select="actions.copy(tab)">
          <template #icon><Link2 /></template>
          复制链接
        </ContextMenuItem>
      </template>
    </ContextMenu>
  </Inline>
</template>
