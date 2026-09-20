<script setup lang="ts">
  import { Check } from '@lucide/vue'
  import type { OwnedDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationBadgeGrid' })

  const props = defineProps<{
    me: CurrentUser
    items: OwnedDecoration[]
    selectedIds: number[]
    equipping: boolean
    limit: number
  }>()
  const emit = defineEmits<{ toggle: [number] }>()

  const selected = computed(() => new Set(props.selectedIds))
  const atLimit = computed(() => props.selectedIds.length >= props.limit)

  const TILE_CLASS =
    'relative w-full cursor-pointer rounded-xl border transition-colors disabled:cursor-default disabled:opacity-50'
  const CHECK_CLASS =
    'absolute left-1.5 top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-white'
</script>

<template>
  <div v-if="items.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    <div v-for="item in items" :key="item.id" class="relative">
      <Button
        unstyled
        :disabled="equipping || (atLimit && !selected.has(item.id))"
        :class="[
          TILE_CLASS,
          selected.has(item.id)
            ? 'border-primary bg-primary/5'
            : 'border-surface hover:bg-emphasis',
        ]"
        @click="emit('toggle', item.id)"
      >
        <SpaceSettingDecorationTile :me="me" :decoration="item" />
        <span v-if="selected.has(item.id)" :class="CHECK_CLASS">
          <Check :size="11" :stroke-width="3" />
        </span>
      </Button>
      <SpaceSettingDecorationInfo :decoration="item" class="absolute top-1.5 right-1.5 z-20" />
    </div>
  </div>

  <p v-else class="text-sm text-muted-color">还没有徽章</p>
</template>
