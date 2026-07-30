<script setup lang="ts">
  import { Check } from '@lucide/vue'
  import type { OwnedDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationOwnedGrid' })

  defineProps<{
    me: CurrentUser
    items: OwnedDecoration[]
    selectedId: number | null
    equipping: boolean
  }>()
  const emit = defineEmits<{ equip: [number | null] }>()

  const TILE_CLASS =
    'relative w-full cursor-pointer rounded-xl border transition-colors disabled:cursor-default disabled:opacity-60'
  const CHECK_CLASS =
    'absolute left-1.5 top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-white'
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Button
        unstyled
        :disabled="equipping"
        :class="[
          TILE_CLASS,
          selectedId === null ? 'border-primary bg-primary/5' : 'border-surface hover:bg-emphasis',
        ]"
        @click="emit('equip', null)"
      >
        <SpaceSettingDecorationTile :me="me" :decoration="null" />
        <span v-if="selectedId === null" :class="CHECK_CLASS">
          <Check :size="11" :stroke-width="3" />
        </span>
      </Button>

      <div v-for="item in items" :key="item.id" class="relative">
        <Button
          unstyled
          :disabled="equipping"
          :class="[
            TILE_CLASS,
            selectedId === item.id
              ? 'border-primary bg-primary/5'
              : 'border-surface hover:bg-emphasis',
          ]"
          @click="emit('equip', item.id)"
        >
          <SpaceSettingDecorationTile :me="me" :decoration="item" />
          <span v-if="selectedId === item.id" :class="CHECK_CLASS">
            <Check :size="11" :stroke-width="3" />
          </span>
        </Button>
        <SpaceSettingDecorationInfo :decoration="item" class="absolute top-1.5 right-1.5 z-20" />
      </div>
    </div>

    <p v-if="!items.length" class="mt-3 text-sm text-muted-color">还没有头像框</p>
  </div>
</template>
