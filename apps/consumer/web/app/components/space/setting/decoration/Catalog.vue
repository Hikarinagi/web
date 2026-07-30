<script setup lang="ts">
  import type { ShopDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationCatalog' })

  const props = defineProps<{
    me: CurrentUser
    frames: ShopDecoration[]
    badges: ShopDecoration[]
    ownedIds: Set<number>
  }>()
  const emit = defineEmits<{ buy: [ShopDecoration] }>()

  const type = ref<'AVATAR_FRAME' | 'BADGE'>('AVATAR_FRAME')
  const CATEGORIES = [
    { key: 'PERMANENT', label: '常驻' },
    { key: 'ACHIEVEMENT', label: '成就' },
    { key: 'LIMITED', label: '限定' },
  ] as const

  const activeItems = computed(() => (type.value === 'AVATAR_FRAME' ? props.frames : props.badges))
  const groups = computed(() =>
    CATEGORIES.map(category => ({
      ...category,
      items: activeItems.value.filter(item => item.category === category.key),
    })).filter(group => group.items.length),
  )

  function acquireHint(item: ShopDecoration) {
    if (item.category === 'ACHIEVEMENT') return '未解锁'
    if (item.category === 'LIMITED') return '限定'
    return '非卖'
  }

  const typeOptions = [
    { label: '头像框', value: 'AVATAR_FRAME' },
    { label: '徽章', value: 'BADGE' },
  ]
</script>

<template>
  <div class="flex flex-col gap-5">
    <SelectButton
      v-model="type"
      :options="typeOptions"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      size="small"
      class="self-start"
    />

    <div v-for="group in groups" :key="group.key">
      <p class="mb-2 text-sm font-medium text-muted-color">{{ group.label }}</p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="item in group.items"
          :key="item.id"
          class="relative rounded-xl border border-surface"
        >
          <SpaceSettingDecorationTile :me="me" :decoration="item">
            <template #footer>
              <Tag v-if="ownedIds.has(item.id)" value="已拥有" severity="secondary" rounded />
              <Button
                v-else-if="item.price != null"
                size="small"
                severity="secondary"
                @click="emit('buy', item)"
              >
                <HikariPoint class="size-3.5" aria-hidden="true" />
                <span class="ml-1">{{ item.price }}</span>
              </Button>
              <Tag v-else :value="acquireHint(item)" severity="secondary" rounded />
            </template>
          </SpaceSettingDecorationTile>
          <SpaceSettingDecorationInfo :decoration="item" class="absolute top-1.5 right-1.5 z-20" />
        </div>
      </div>
    </div>

    <p v-if="!groups.length" class="text-sm text-muted-color">还没有上架的装扮</p>
  </div>
</template>
